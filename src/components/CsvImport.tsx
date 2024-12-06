import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { Contact } from '../types/Contact';
import toast from 'react-hot-toast';

interface CsvImportProps {
  onImport: (contacts: Contact[]) => void;
}

export function CsvImport({ onImport }: CsvImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const contacts = results.data.map((row: any) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            company: row.company,
            businessId: row.businessId,
            email: row.email,
            phone: row.phone
          }));
          onImport(contacts);
          toast.success(`${contacts.length} contatos importados com sucesso!`);
        },
        header: true
      });
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <Upload className="w-4 h-4 mr-2" />
        Importar CSV
      </button>
    </div>
  );
}