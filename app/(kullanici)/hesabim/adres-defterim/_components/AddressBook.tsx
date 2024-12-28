import React from "react";
import AddressForm from "./AddressForm";

const AddressBook = ({ email }) => {
  return (
    <div>
      <h1 className="text-xl font-thin">Adreslerim (0)</h1>
      <p className="text-xs text-gray-600">
        Henüz hiç adres eklememişsiniz. Buradan bir adres ekleyebilirsiniz.
      </p>
      <div className="lg:w-3/4">
        <AddressForm email={email} />
      </div>
    </div>
  );
};

export default AddressBook;
