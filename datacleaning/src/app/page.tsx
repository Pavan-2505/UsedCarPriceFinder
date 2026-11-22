import UploadMainComponent from "@/components/upload-components/UploadMainComponent";

export default function Home() {
  return (
    <div className="font-Inter bg-background flex flex-col items-center ">
      <header className="w-full h-30 text-center px-12 mt-4">
        <h1 className="text-primary-headings tracking-tighter leading-tight " >Data Cleaner</h1>
        <p>Manually Cleaning Data With Code ? Try This!</p>
      </header>
      <UploadMainComponent />
    </div>
  );
}
