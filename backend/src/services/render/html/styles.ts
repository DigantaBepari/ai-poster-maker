export function posterStyles(
  width: number,
  height: number,
  background: string,
) {
  return (
    "*{box-sizing:border-box}html,body{margin:0;width:" +
    width +
    "px;height:" +
    height +
    "px;overflow:hidden}body{background:" +
    background +
    ';font-family:"Noto Sans Bengali",sans-serif}#poster{position:relative;width:100%;height:100%;overflow:hidden}.canvas{position:absolute;transform-origin:top left}.slot{position:absolute;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.4;padding:2px 5px;font-weight:700;white-space:normal;overflow-wrap:anywhere;word-break:normal}.slot span{display:block;max-width:100%}.photo{position:absolute;object-fit:cover;border:5px solid var(--accent);background:#eee}.placeholder{display:flex;align-items:center;justify-content:center;color:#85988d;font-size:50px}.motifs{position:absolute;inset:0;pointer-events:none}.watermark{position:absolute;bottom:5px;right:22px;font-size:10px;opacity:.55;color:white}@page{size:' +
    width +
    "px " +
    height +
    "px;margin:0}"
  );
}
