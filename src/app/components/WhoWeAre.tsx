export default function WhoWeAre() {
  return (
    <section className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 my-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Who We Are</h2>
      <p className="text-gray-700 text-center mb-4">
        Christian Youth in Power (CYP) is the Youth Outreach of The Community of the Good Shepherd- a covenanted SOS community
      </p>
      <p className="text-gray-700 text-center mb-6">
        CYP is a movement of Christian youth, both students and working youth who aspire to be and make disciples of Our Lord and Saviour, Jesus Christ. We seek to evangelize and train them to be future leaders in the ‘Power of the Holy Spirit’ for the service of the Church and society.
      </p>
      <div className="w-full flex justify-center">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/1Q8fG0TtVAY" // Replace with your actual video ID
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-lg w-full max-w-xl h-64"
        ></iframe>
      </div>
    </section>
  );
}
