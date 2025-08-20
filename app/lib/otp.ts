export function generateOtp(n = 6) {
  let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random()*10);
  return s;
}
export function expiresIn(minutes = 10) {
  const d = new Date(); d.setMinutes(d.getMinutes() + minutes); return d;
}
