// 비밀번호 재설정 페이지. 비밀번호를 다루는 페이지라 외부 스크립트(CDN)를 불러오지 않고
// Supabase Auth API 를 직접 호출한다. 복구 토큰은 메모리에만 두고 주소창에서 바로 지운다.

// 공개 anon 키 — 클라이언트에 노출되도록 설계된 값이며, 접근은 RLS로 제한된다.
const SUPABASE_URL = 'https://lfjysmkgrcjijukzzyfo.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmanlzbWtncmNqaWp1a3p6eWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzAxNTMsImV4cCI6MjA5NTQ0NjE1M30.FoR4ft3N-i_89omm8YtrDrMW8t_He98P3aJL8DGAOkg'
const MIN_PASSWORD = 8

const msg = document.getElementById('msg')
const formArea = document.getElementById('formArea')
const btn = document.getElementById('submit')

function show(text, kind) {
  msg.textContent = text
  msg.className = 'msg ' + kind
}

const params = new URLSearchParams(location.hash.slice(1))
const token = params.get('access_token')
const expiresAt = Number(params.get('expires_at') || 0)
const valid = !!token && params.get('type') === 'recovery' && (!expiresAt || expiresAt * 1000 > Date.now())
history.replaceState(null, '', location.pathname)

if (!valid) {
  show('링크가 만료되었거나 올바르지 않습니다. 앱에서 다시 요청해주세요.', 'err')
  formArea.classList.add('hide')
}

btn.addEventListener('click', async () => {
  const pw1 = document.getElementById('pw1').value
  const pw2 = document.getElementById('pw2').value

  if (pw1.length < MIN_PASSWORD) { show(`비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`, 'err'); return }
  if (pw1 !== pw2) { show('비밀번호가 서로 다릅니다.', 'err'); return }

  btn.disabled = true
  btn.textContent = '변경 중...'

  let ok = false
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw1 }),
    })
    ok = res.ok
  } catch {
    ok = false
  }

  if (!ok) {
    show('변경에 실패했습니다. 링크가 만료되었거나 예전 비밀번호와 같을 수 있어요. 앱에서 다시 요청해주세요.', 'err')
    btn.disabled = false
    btn.textContent = '변경하기'
    return
  }

  show('비밀번호가 변경되었습니다. 앱으로 돌아가 새 비밀번호로 로그인해주세요.', 'ok')
  formArea.classList.add('hide')
})
