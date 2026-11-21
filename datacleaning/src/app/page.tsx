import UploadCSVComponent from "@/components/UploadCSVComponent";
import UploadKaggleComponent from "@/components/UploadKaggleComponent";

export default function Home() {
  return (
    <div className="font-Inter bg-background px-12 flex flex-col items-center ">
      <header className="w-full h-30 text-center mt-4">
        <h1 className="text-primary-headings tracking-tighter leading-tight " >Data Cleaner</h1>
        <p>Manually Cleaning Data With Code ? Try This!</p>
      </header>
      <main className="w-140 mt-10">
        <UploadCSVComponent/>
        <div className="flex items-center gap-2 my-4">
          <div className="w-full h-0.5 bg-border" />
          <p className=" text-para">OR</p>
          <div className="w-full h-0.5 bg-border" />
        </div>
        <UploadKaggleComponent />
      </main>
    </div>
  );
}
