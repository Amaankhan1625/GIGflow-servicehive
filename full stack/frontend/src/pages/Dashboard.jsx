import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserGigs, fetchUserBids } from '../features/gigsSlice';
import { socket } from '../store';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { userGigs, userBids, isLoading, error } = useSelector((state) => state.gigs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchUserGigs());
    dispatch(fetchUserBids());

    // Listen for real-time notifications
    socket.on('freelancerHired', (data) => {
      if (data.freelancerId === user.id) {
        setNotifications((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off('freelancerHired');
    };
  }, [user, dispatch, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}!</h1>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
          <h3 className="font-bold">Notifications</h3>
          {notifications.map((notif, index) => (
            <p key={index}>{notif.message}</p>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* My Gigs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">My Gigs</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : userGigs.length === 0 ? (
            <p className="text-gray-500">You haven't posted any gigs yet.</p>
          ) : (
            <div className="space-y-4">
              {userGigs.map((gig) => (
                <div key={gig._id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold">{gig.title}</h3>
                  <p className="text-gray-600 text-sm">{gig.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-semibold">${gig.budget}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/gigs/${gig._id}`)}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Bids */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">My Bids</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : userBids.length === 0 ? (
            <p className="text-gray-500">You haven't placed any bids yet.</p>
          ) : (
            <div className="space-y-4">
              {userBids.map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold">{bid.gig?.title || 'Gig Title'}</h3>
                  <p className="text-gray-600 text-sm">{bid.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-semibold">${bid.price}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
