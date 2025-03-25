import React from 'react';

function DogDetails({ dog }) {
  if (!dog) {
    console.warn('DogDetails: No dog data provided');
    return null;
  }

  console.log('DogDetails render - Full dog object:', JSON.stringify(dog, null, 2));
  console.log('DogDetails props check:', {
    id: dog?.id,
    name: dog?.name,
    price: dog?.price,
    available: dog?.available,
    gender: dog?.gender,
    breed: dog?.breed,
    registrationName: dog?.registrationName
  });
  const genderSymbol = dog.gender === 'male' ? '♂' : '♀';

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold text-stone-800">{dog.name}</h1>
          <span className="text-3xl">{genderSymbol}</span>
        </div>
        {dog.registrationName && (
          <p className="text-lg text-stone-600">Registration: {dog.registrationName}</p>
        )}
        {dog.sold ? (
          <div className="mt-2 bg-red-500 py-2 px-4 rounded-md inline-flex items-center">
            <p className="text-lg font-semibold text-white">
              Sold
            </p>
          </div>
        ) : dog.price && dog.available ? (
          <p className="text-2xl font-semibold text-amber-600">${dog.price.toLocaleString()}</p>
        ) : null}
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