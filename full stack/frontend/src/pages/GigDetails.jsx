import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGigDetails, fetchGigBids, placeBid, hireFreelancer, updateGig, deleteGig, addNewBid } from '../features/gigsSlice';
import { socket } from '../store';

const GigDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentGig, gigBids, isLoading, error } = useSelector((state) => state.gigs);

  const [bidForm, setBidForm] = useState({
    message: '',
    price: ''
  });
  const [showBidForm, setShowBidForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budget: ''
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGigDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentGig && user && currentGig.ownerId._id === user.id) {
      dispatch(fetchGigBids(id));
    }
  }, [dispatch, currentGig, user, id]);

  useEffect(() => {
    // Listen for new bids on this gig
    if (socket) {
      socket.on('newBid', (newBid) => {
        if (newBid.gigId === id) {
          dispatch(addNewBid(newBid));
        }
      });

      return () => {
        socket.off('newBid');
      };
    }
  }, [dispatch, id]);

  const handleBidSubmit = (e) => {
    e.preventDefault();
    dispatch(placeBid({ gigId: id, ...bidForm })).then(() => {
      setBidForm({ message: '', price: '' });
      setShowBidForm(false);
    });
  };

  const handleHire = (bidId) => {
    dispatch(hireFreelancer(bidId));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(updateGig({ gigId: id, gigData: editForm })).then(() => {
      setShowEditForm(false);
    });
  };

  const handleDelete = () => {
    dispatch(deleteGig(id)).then(() => {
      navigate('/dashboard');
    });
  };

  const startEdit = () => {
    setEditForm({
      title: currentGig.title,
      description: currentGig.description,
      budget: currentGig.budget
    });
    setShowEditForm(true);
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!currentGig) return <div className="text-center">Gig not found</div>;

  const isOwner = user && currentGig.ownerId._id === user.id;
  const hasPlacedBid = gigBids.some(bid => bid.freelancerId._id === user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{currentGig.title}</h1>
            <p className="text-gray-600 mt-2">{currentGig.description}</p>
          </div>
          {isOwner && currentGig.status === 'open' && (
            <div className="flex space-x-2">
              <button
                onClick={startEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Edit Gig
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Gig
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-green-600">${currentGig.budget}</span>
          <span className={`px-3 py-1 rounded text-sm ${
            currentGig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {currentGig.status}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Posted by {currentGig.ownerId.name} on {new Date(currentGig.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && isOwner && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Edit Gig</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={editForm.budget}
                onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
          <p className="text-gray-600 mb-4">Are you sure you want to delete this gig? This action cannot be undone.</p>
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bidding Section */}
      {user && !isOwner && currentGig.status === 'open' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Place Your Bid</h2>
          {!hasPlacedBid ? (
            <>
              <button
                onClick={() => setShowBidForm(!showBidForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
              >
                {showBidForm ? 'Cancel' : 'Place Bid'}
              </button>

              {showBidForm && (
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={bidForm.message}
                      onChange={(e) => setBidForm({...bidForm, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Describe why you're the right person for this job..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Your Price ($)
                    </label>
                    <input
                      type="number"
                      value={bidForm.price}
                      onChange={(e) => setBidForm({...bidForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Submit Bid
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="text-green-600">You have already placed a bid on this gig.</p>
          )}
        </div>
      )}

      {/* Bids Section (Only for gig owner) */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Bids ({gigBids.length})</h2>
          {gigBids.length === 0 ? (
            <p className="text-gray-500">No bids yet.</p>
          ) : (
            <div className="space-y-4">
              {gigBids.map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{bid.freelancerId.name}</h3>
                      <p className="text-gray-600">{bid.message}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">${bid.price}</span>
                      <div className={`mt-1 px-2 py-1 rounded text-sm ${
                        bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bid.status}
                      </div>
                    </div>
                  </div>
                  {bid.status === 'pending' && currentGig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Hire This Freelancer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;
