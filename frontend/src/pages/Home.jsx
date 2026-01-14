import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGigs } from '../features/gigsSlice';
import { Link } from 'react-router-dom';

const Home = () => {
  const { gigs, isLoading } = useSelector((state) => state.gigs);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchGigs(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(searchQuery));
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Next Gig</h1>
        <p className="text-xl text-gray-600 mb-6">Connect with freelancers and get your projects done</p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="flex">
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center">Loading gigs...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-green-600">${gig.budget}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {gig.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Posted by {gig.ownerId.name}</span>
              </div>
              <Link
                to={`/gigs/${gig._id}`}
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {gigs.length === 0 && !isLoading && (
        <div className="text-center text-gray-500">
          No gigs found. <Link to="/create-gig" className="text-blue-600 hover:underline">Post the first one!</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
