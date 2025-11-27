"use client";

import { useState } from "react";

const faqData = [
  {
    question: "Was ist ein KI-generiertes Bild oder Video?",
    answer: "Unsere KI erstellt auf Basis deiner Angaben komplett neue Bilder oder Videos – individuell, neu und perfekt auf dein Unternehmen abgestimmt."
  },
  {
    question: "Welche Arten von Videos und Bildern kann ich erstellen?",
    answer: "Von Firmenporträts über Produkt- und Dienstleistungsvideos bis hin zu Social-Media-Clips, Testimonials oder Bildern für Marketing und Webseiten – fast alles ist möglich."
  },
  {
    question: "Wie funktioniert die Erstellung eines KI-Bildes?",
    answer: "Du kannst einfach in Textform beschreiben, was du möchtest – und unsere KI erzeugt das passende Bild. Alternativ kannst du ein bestehendes Bild hochladen und nach deinen Wünschen verändern."
  },
  {
    question: "Wie funktioniert die Erstellung eines KI-Videos?",
    answer: "Am einfachsten gibst du deine Webseite an. Unsere KI sammelt automatisch Text und Bilder und erstellt einen ersten Videovorschlag. Danach kannst du das Video bis zu drei Mal per Texteingabe anpassen lassen."
  },
  {
    question: "Brauche ich Erfahrung in Bild- oder Videobearbeitung?",
    answer: "Nein. Unsere KI führt dich durch alles – komplett ohne Vorkenntnisse, ohne technische Hürden."
  },
  {
    question: "Wie lange dauert die Erstellung eines KI-Bildes oder -Videos?",
    answer: "Je nach Umfang dauert der Prozess nur wenige Sekunden bis hin zu wenigen Minuten."
  },
  {
    question: "Kann ich mein eigenes Material einfügen?",
    answer: "Ja, du kannst eigene Bilder und Texte hochladen, um alles noch persönlicher und markengerecht zu gestalten. Eigene Videos können aktuell noch nicht weiterverarbeitet werden."
  },
  {
    question: "In welchen Formaten erhalte ich die fertigen Bilder und Videos?",
    answer: "Du erhältst sie in allen gängigen Formaten – optimiert für deinen Einsatzzweck (Webseite, Social Media, Print, Präsentationen usw.)."
  },
  {
    question: "Welche Nutzungsrechte habe ich an den erstellten Inhalten?",
    answer: "Alle KI-generierten Bilder und Videos gehören dir. Du erhältst volle Nutzungsrechte – auch für die kommerzielle Verwendung."
  },
  {
    question: "Worauf muss ich bei den Nutzungsrechten achten?",
    answer: "Alle Inhalte, die du hochlädst (z. B. Bilder, Logos, Texte, Webseiten), müssen dir gehören oder du musst die Rechte daran besitzen. Falls das Material nicht dir gehört, bleiben die Rechte beim ursprünglichen Eigentümer."
  }
];

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100 pr-8">
          {question}
        </span>
        <svg
          className={`w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Häufig gestellte Fragen
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Alles, was du über KI-generierte Marketinginhalte wissen musst
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Noch Fragen? Wir helfen dir gerne weiter!
          </p>
          <a
            href="#hero"
            className="inline-block px-8 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </div>
    </section>
  );
}
