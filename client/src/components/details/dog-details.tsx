import React from 'react';

function DogDetails({ dog }) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold text-stone-800">{dog.name}</h1>
              {dog.registrationName && (
                <p className="text-lg text-stone-600">Registration: {dog.registrationName}</p>
              )}
              {dog.price && dog.available && (
                <p className="text-xl font-semibold text-amber-600">Price: ${parseInt(dog.price).toLocaleString()}</p>
              )}
            </div>
      <div className="mt-4">
        <img src={dog.image} alt={dog.name} className="w-full h-64 object-cover rounded-lg" />
      </div>
      <div className="mt-4">
        <p className="text-lg text-stone-600">{dog.description}</p>
      </div>
      <div className="mt-4">
          <p className="text-lg text-stone-600">Breed: {dog.breed}</p>
          <p className="text-lg text-stone-600">Age: {dog.age}</p>
          <p className="text-lg text-stone-600">Sex: {dog.sex}</p>
      </div>

    </div>
  );
}

export default DogDetails;