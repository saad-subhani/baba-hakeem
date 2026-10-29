import './ProductHowToUse.css';

/** Reusable, product-specific directions presented as a simple four-step ritual. */
export default function ProductHowToUse({ eyebrow = 'THE RITUAL', title = 'How to Use', steps }) {
  if (!Array.isArray(steps) || steps.length !== 4) return null;

  return (
    <section className="product-ritual" aria-labelledby="product-ritual-title">
      <div className="product-ritual__inner">
        <p className="product-ritual__eyebrow">{eyebrow}</p>
        <h2 className="product-ritual__title" id="product-ritual-title">{title}</h2>
        <ol className="product-ritual__steps">
          {steps.map((step, index) => (
            <li className="product-ritual__card" key={`${step.title}-${index}`}>
              <span className="product-ritual__number">STEP {String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
