import { createContext, useContext, useState } from "react";

const BeneficiaryContext = createContext();

export const BeneficiaryProvider = ({ children }) => {
  const [beneficiaries, setBeneficiaries] = useState([
    { name: "John Doe", number: "0826545879", network: "Vodacom" },
    { name: "Jane Doe", number: "0831234567", network: "MTN" },
  ]);

  const addBeneficiary = (newBeneficiary) => {
    setBeneficiaries((prev) => [...prev, newBeneficiary]);
  };

  return (
    <BeneficiaryContext.Provider value={{ beneficiaries, addBeneficiary }}>
      {children}
    </BeneficiaryContext.Provider>
  );
};

export const useBeneficiaries = () => useContext(BeneficiaryContext);
