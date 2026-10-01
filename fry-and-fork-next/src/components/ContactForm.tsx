"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Icon } from "@/components/Icon";
import { SITE } from "@/lib/site";

type ResultKind = "sent" | "offline" | "error";

const RESULTS: Record<ResultKind, { icon: string; title: string; text: string; call: boolean; back: string }> = {
  sent: { icon: "i-check", title: "", text: "Your message is on its way. We’ll get back to you soon.", call: false, back: "Send another message" },
  offline: { icon: "i-phone-solid", title: "Online messages aren’t switched on yet", text: "Please give us a call and we’ll gladly help.", call: true, back: "Back to the form" },
  error: { icon: "i-alert", title: "Sorry, that didn’t send", text: "Please try again in a moment, or give us a call.", call: true, back: "Try again" },
};

/** The "Let's Talk" form. Posts the message as JSON to SITE.contactEndpoint (a form service
 *  such as Formspree); until that's set, sending asks the visitor to call instead. What
 *  happened is shown over the fields. */
export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ kind: ResultKind; name?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (result) titleRef.current?.focus();
  }, [result]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      data[key] = String(value).trim();
    });
    const first = data.name.split(/\s+/)[0];
    if (data._gotcha) return setResult({ kind: "sent", name: first }); // only bots fill the hidden field
    delete data._gotcha;
    if (!SITE.contactEndpoint) return setResult({ kind: "offline" });
    setSending(true);
    try {
      const res = await fetch(SITE.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: "Website message: " + data.subject }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      setResult({ kind: "sent", name: first });
    } catch {
      setResult({ kind: "error" });
    } finally {
      setSending(false);
    }
  }

  function backToForm() {
    flushSync(() => setResult(null));
    formRef.current?.querySelector("input")?.focus();
  }

  const r = result ? RESULTS[result.kind] : null;
  return (
    <form ref={formRef} className="contact-form" aria-labelledby="contact-form-title" onSubmit={onSubmit}>
      <div className="contact-fields" inert={result !== null}>
        <div className="contact-row">
          <label className="contact-field">
            <span className="visually-hidden">Your name</span>
            <input name="name" type="text" autoComplete="name" placeholder="Your Name *" required />
          </label>
          <label className="contact-field">
            <span className="visually-hidden">Your email</span>
            <input name="email" type="email" autoComplete="email" placeholder="Your Email *" required />
          </label>
        </div>
        <label className="contact-field">
          <span className="visually-hidden">Phone number (optional)</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Phone Number (Optional)" />
        </label>
        <label className="contact-field contact-select">
          <span className="visually-hidden">Subject</span>
          <select name="subject" required defaultValue="">
            <option value="" disabled hidden>
              Subject *
            </option>
            <option>A question about the menu</option>
            <option>Allergies &amp; dietary needs</option>
            <option>A large or party order</option>
            <option>Feedback</option>
            <option>Something else</option>
          </select>
          <Icon id="i-chevron-down" />
        </label>
        <label className="contact-field">
          <span className="visually-hidden">Your message</span>
          <textarea name="message" rows={4} placeholder="Your Message *" required />
        </label>
        <label className="contact-trap visually-hidden" aria-hidden="true">
          Leave this empty
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
        <button className="contact-send" type="submit" disabled={sending}>
          <span>{sending ? "Sending…" : "Send Message"}</span>
          <Icon id="i-arrow-right" />
        </button>
      </div>
      <div className="contact-result" role="status" hidden={!r}>
        <span className="contact-result-icon">
          <Icon id={r ? r.icon : "i-check"} />
        </span>
        <p className="contact-result-title" tabIndex={-1} ref={titleRef}>
          {result && r ? (result.kind === "sent" ? `Thanks, ${result.name}!` : r.title) : null}
        </p>
        <p className="contact-result-text">{r?.text}</p>
        <div className="contact-result-actions">
          <a className="contact-send" href={SITE.phoneHref} hidden={!r?.call}>
            Call {SITE.phone}
          </a>
          <button className="contact-result-back" type="button" onClick={backToForm}>
            {r?.back}
          </button>
        </div>
      </div>
    </form>
  );
}
