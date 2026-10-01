import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { SITE } from "@/lib/site";

/** "We'd Love to Hear from You": ways to reach the shop on the left, and a message form
 *  over the restaurant photo on the right, which is cut with the design's rounded chevron. */
export function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-photo" aria-hidden="true" />
      <div className="container contact-inner">
        <div className="contact-intro reveal">
          <p className="contact-kicker">Get in Touch</p>
          <h2 id="contact-title">
            We’d Love to <br />
            Hear from <em>You</em>
          </h2>
          <p className="contact-lede">Whether you have a question about the menu, a big order to plan, or just fancy saying hello, we’re here to help.</p>
          <ul className="contact-cards">
            <li className="contact-card">
              <span className="contact-card-icon">
                <Icon id="i-phone-solid" />
              </span>
              <h3>Call Us</h3>
              <a className="contact-card-main" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
              <p>Call to order for collection</p>
            </li>
            <li className="contact-card">
              <span className="contact-card-icon">
                <Icon id="i-clock-solid" />
              </span>
              <h3>Opening Hours</h3>
              <p className="contact-card-main">Open 7 days</p>
              <p>3pm till 10:30pm, 11:30pm Fri &amp; Sat</p>
            </li>
            <li className="contact-card">
              <span className="contact-card-icon">
                <Icon id="i-pin-solid" />
              </span>
              <h3>Visit Us</h3>
              <p className="contact-card-main">
                {SITE.street},
                <br />
                {SITE.town} {SITE.postcode}
              </p>
              <p>
                <a href={SITE.mapUrl} target="_blank" rel="noopener">
                  Find us on the map
                </a>
              </p>
            </li>
          </ul>
          <a className="contact-map-btn" href={SITE.mapUrl} target="_blank" rel="noopener">
            View on Map
            <span className="contact-map-go">
              <Icon id="i-arrow-right" />
            </span>
          </a>
        </div>

        <div className="contact-form-area reveal">
          <div className="contact-form-card">
            <p className="contact-form-kicker">Send Us a Message</p>
            <h3 id="contact-form-title">Let’s Talk</h3>
            <p className="contact-form-lede">Have a question, special request or feedback? Fill out the form and we’ll get back to you shortly.</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
