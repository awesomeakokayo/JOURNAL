export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-primary mb-8">
        About the Journal
      </h1>

      <div className="prose max-w-none space-y-6 text-text">
        <section className="bg-surface rounded-lg border border-gray-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-3">
            Coal City University Journal of Education
          </h2>
          <p className="mb-3">
            The Coal City University Journal of Education is a peer-reviewed
            academic journal published by Coal City University, Enugu. It serves
            as a platform for scholars, researchers, and practitioners to
            disseminate original research findings, theoretical developments,
            and practical innovations in the field of education.
          </p>
          <p>
            Our mission is to advance knowledge and promote scholarly discourse
            across all areas of education, including curriculum development,
            educational technology, teacher education, and educational
            leadership.
          </p>
        </section>

        <section className="bg-surface rounded-lg border border-gray-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-3">
            Publication Frequency
          </h2>
          <p>
            The journal is published biannually, with issues released in June and
            December. Special issues may be published periodically to address
            emerging topics in education.
          </p>
        </section>

        <section className="bg-surface rounded-lg border border-gray-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-3">
            Submission Guidelines
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Manuscripts must be original and not under consideration elsewhere.
            </li>
            <li>
              Submissions should be in PDF, DOC, or DOCX format.
            </li>
            <li>
              Each submission must include a title, author name(s), abstract,
              and category.
            </li>
            <li>
              All submissions undergo a peer review process.
            </li>
            <li>
              Authors retain copyright; the journal retains right of first
              publication.
            </li>
          </ul>
        </section>

        <section className="bg-surface rounded-lg border border-gray-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-3">
            Contact
          </h2>
          <p>
            For inquiries, please contact the editorial board at Coal City
            University, Enugu State, Nigeria.
          </p>
        </section>
      </div>
    </div>
  );
}
