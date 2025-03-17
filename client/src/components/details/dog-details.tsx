import React from 'react';

function DogDetails({ dog }) {
  console.log('DogDetails component rendered with dog:', dog);
  console.log('Dog full data:', {
    price: dog.price,
    available: dog.available,
    registrationName: dog.registrationName,
    name: dog.name
  });
  const genderSymbol = dog.gender === 'male' ? '♂' : '♀';

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold text-stone-800">{dog.name}</h1>
          <span className="text-3xl">{genderSymbol}</span>
        </div>
        {console.log('Dog Details:', dog)}
        {console.log('Price:', dog.price)}
        {console.log('Available:', dog.available)}
        {dog.registrationName && (
          <p className="text-lg text-stone-600">Registration: {dog.registrationName}</p>
        )}
        {console.log('Price condition check:', dog.price > 0)}
        {console.log('Price rendering attempted:', dog.price)}
        {dog.price > 0 ? (
          <p className="text-2xl font-semibold text-amber-600">${dog.price.toLocaleString()}</p>
        ) : (
          console.log('Price not displayed because condition failed')
        )}
      </div>
      {dog.profileImageUrl && (
        <div className="mt-4">
          <img src={dog.profileImageUrl} alt={dog.name} className="w-full h-64 object-cover rounded-lg" />
        </div>
      )}
      {dog.description && (
        <div className="mt-4">
          <p className="text-lg text-stone-600">{dog.description}</p>
        </div>
      )}
      <div className="mt-4">
        <p className="text-lg text-stone-600">Breed: {dog.breed}</p>
        {dog.gender && <p className="text-lg text-stone-600">Gender: {dog.gender}</p>}
        {dog.birthDate && (
          <p className="text-lg text-stone-600">
            Birth Date: {new Date(dog.birthDate).toLocaleDateString()}
          </p>
        )}
      </div>
      {dog.narrativeDescription && (
        <div className="mt-4">
          <p className="text-lg text-stone-600">{dog.narrativeDescription}</p>
        </div>
      )}
    </div>
  );
}

export default DogDetails;