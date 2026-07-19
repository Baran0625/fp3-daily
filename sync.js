/* =============================================================
   記録をGoogleスプレッドシートに同期するモジュール
   -------------------------------------------------------------
   使い方:
   1. gas/SheetSync.gs をGASにデプロイ（ウェブアプリ / アクセス:全員）
   2. 発行された /exec のURLを、下の SYNC_URL に貼る
   ※ SYNC_URL が空のあいだは同期は無効で、ローカル保存(localStorage)のみで動きます。

   仕組み:
   - 書き込み(save)は no-cors の POST（text/plain）でプリフライトを回避。
     応答は読めない代わりに、CORSやリダイレクトで失敗しにくい確実な方式。
   - 読み込み(loadAll)は JSONP（<script>タグ）でクロスオリジン制約を回避。

   注意（公開URLについて）:
   このアプリはGitHub Pagesで公開されるため、SYNC_URL はページのソースから見えます。
   誰かがURLを知ると書き込みができてしまいますが、個人の学習記録用途なら実害は小さめです。
   気になる場合は、GAS側で合言葉トークンを検証する等の対策を追加してください。
   ============================================================= */

window.SYNC_URL = "https://script.google.com/macros/s/AKfycbxvH_r4YfAnRVDnDh25MybVL7NX9DeUbYv4TD1wz6OiiehvJ2fAYLkgX8XYPJYCL9k/exec";

window.Sync = {
  enabled: function(){ return !!window.SYNC_URL; },

  // 1日分の結果を送信（失敗してもアプリは止めない）
  save: function(session){
    if(!this.enabled()) return Promise.resolve();
    return fetch(window.SYNC_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(session)
    }).catch(function(){ /* オフライン等は無視 */ });
  },

  // 全記録をJSONPで取得。8秒でタイムアウトして空配列を返す
  loadAll: function(){
    return new Promise(function(resolve){
      if(!window.SYNC_URL){ resolve([]); return; }
      var cb = "__fp3cb_" + Date.now();
      var s = document.createElement("script");
      var done = false;
      var timer = setTimeout(function(){ finish([]); }, 8000);
      function finish(data){
        if(done) return; done = true;
        clearTimeout(timer);
        try { delete window[cb]; } catch(e) { window[cb] = undefined; }
        if(s.parentNode) s.parentNode.removeChild(s);
        resolve(Array.isArray(data) ? data : []);
      }
      window[cb] = function(data){ finish(data); };
      s.onerror = function(){ finish([]); };
      s.src = window.SYNC_URL + "?callback=" + cb + "&t=" + Date.now();
      document.body.appendChild(s);
    });
  }
};
