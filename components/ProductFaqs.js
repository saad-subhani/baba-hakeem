'use client';

import { useState } from 'react';
import './ProductFaqs.css';

export default function ProductFaqs({ productName, image, faqs }) {
  let entries = faqs;
  if (typeof entries === 'string') { try { entries = JSON.parse(entries); } catch { entries = []; } }
  entries = Array.isArray(entries) ? entries.filter((item) => item?.question && item?.answer) : [];
  if (!entries.length) return null;
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="product-faqs" aria-labelledby="product-faqs-title">
      <div className="product-faqs__inner">
        <div className="product-faqs__content">
          <div className="product-faqs__image-wrap">
            {image ? <img src={image} alt={productName ? `${productName} product` : 'Product'} loading="lazy" decoding="async" /> : <div className="product-faqs__image-placeholder" aria-hidden="true">{productName}</div>}
          </div>
          <div className="product-faqs__list">
            <header className="product-faqs__heading">
              <p>COMMON QUERIES</p>
              <h2 id="product-faqs-title">Frequently Asked Questions</h2>
            </header>
            {entries.map((faq, index) => (
              <article className={`product-faq${openIndex === index ? ' is-open' : ''}`} key={`${faq.question}-${index}`}>
                <h3>
                  <button type="button" aria-expanded={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                    <span>{faq.question}</span><i aria-hidden="true" />
                  </button>
                </h3>
                {openIndex === index && <div className="product-faq__answer"><p>{faq.answer}</p></div>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
