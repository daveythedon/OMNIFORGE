import { MessageSquare } from 'lucide-react';

const Messaging = () => {
  return (
    <div className="text-center py-12">
      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Messaging Center</h2>
      <p className="text-gray-600">SMS and email communication coming soon...</p>
    </div>
  );
};

export default Messaging;
