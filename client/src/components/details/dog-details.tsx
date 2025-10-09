
import React from 'react';

function DogDetails({ dog, litterWaitlistLink }) {
  if (!dog) {
    console.warn('DogDetails: No dog data provided');
    return null;
  }
  
  console.log('DogDetails render:', {
    name: dog.name,
    sold: dog.sold,
    available: dog.available,
    price: dog.price,
    fullDog: dog
  });

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
        {console.log('Dog Details:', {
          name: dog.name,
          sold: dog.sold,
          price: dog.price,
          available: dog.available
        })}
        {dog.registrationName && (
          <p className="text-lg text-stone-600">Registration: {dog.registrationName}</p>
        )}
        {dog.sold ? (
          <div className="mt-2 bg-red-500 py-2 px-4 rounded-md inline-flex items-center">
            <p className="text-lg font-semibold text-white">
              Sold
            </p>
          </div>
        ) : dog.price && dog.available && !dog.sold ? (
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
          <h3 className="text-xl font-semibold text-stone-800 mb-2">Description</h3>
          <p className="text-lg text-stone-600">{dog.description}</p>
        </div>
      )}
      {(dog.breed || dog.gender || dog.birthDate || dog.color || dog.furLength || dog.height || dog.weight) && (
        <div className="mt-4">
          {dog.breed && <p className="text-lg text-stone-600">Breed: {dog.breed}</p>}
          {dog.gender && <p className="text-lg text-stone-600">Gender: {dog.gender}</p>}
          {dog.birthDate && (
            <p className="text-lg text-stone-600">
              Birth Date: {new Date(dog.birthDate).toLocaleDateString()}
            </p>
          )}
          {dog.color && <p className="text-lg text-stone-600">Color: {dog.color}</p>}
          {dog.furLength && <p className="text-lg text-stone-600">Fur Length: {dog.furLength}</p>}
          {dog.height && <p className="text-lg text-stone-600">Height: {dog.height} inches</p>}
          {dog.weight && <p className="text-lg text-stone-600">Weight: {dog.weight} lbs</p>}
        </div>
      )}
      {dog.narrativeDescription && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-stone-800 mb-2">Story</h3>
          <p className="text-lg text-stone-600">{dog.narrativeDescription}</p>
        </div>
      )}
      {dog.healthData && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-stone-800 mb-2">Health Information</h3>
          <p className="text-lg text-stone-600">{dog.healthData}</p>
        </div>
      )}
      {litterWaitlistLink && !dog.sold && (
        <div className="mt-6">
          <a 
            href={litterWaitlistLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Interested? Sign Up Here
          </a>
        </div>
      )}
    </div>
  );
}

export default DogDetails;
