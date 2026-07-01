// Cloudflare Snippet: inject LocalBusiness JSON-LD into every HTML <head>.
// __SCHEMA__ is replaced at deploy time with the object from norcalcarbmobile.schema.json.
// Fails OPEN: any error returns the original response untouched, so the site can never break.
export default {
  async fetch(request) {
    try {
      const res = await fetch(request);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("text/html")) return res;
      const data = __SCHEMA__;
      const tag =
        '<script type="application/ld+json">' + JSON.stringify(data) + "</script>";
      return new HTMLRewriter()
        .on("head", {
          element(el) {
            el.append(tag, { html: true });
          },
        })
        .transform(res);
    } catch (e) {
      return fetch(request);
    }
  },
};
