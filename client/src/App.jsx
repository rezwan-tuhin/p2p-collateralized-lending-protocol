import './App.css';
import { LoanProvider } from "./context/LoanContext";
import Navbar from "./components/Navbar";
import { CreateLoanForm } from "./components/CreateLoanForm";
import { LoanTable } from "./components/LoanTable";

export default function App() {
  return (
    <LoanProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6 space-y-6">
          <CreateLoanForm />
          <LoanTable />
        </main>
      </div>
    </LoanProvider>

  );
}



//