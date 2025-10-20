import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white flex flex-col items-center justify-center py-6 shadow-md border-b border-gray-200">
      <Image
        src="/CYP_logo.png" // Replace with your actual logo path if available
        alt="CYP Logo"
        width={80}
        height={80}
        className="mb-2"
        priority
      />
      <h1 className="text-[2.5em] mb-[5px] font-bold text-[#007bff] text-center tracking-wide sm:text-[2em] xs:text-[1.5em]">
        Christian Youth in Power
      </h1>
    </header>
  );
}
