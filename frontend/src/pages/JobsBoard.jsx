import { Briefcase } from 'lucide-react';

const JobsBoard = () => {
  return (
    <div className="text-center py-12">
      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobs Board</h2>
      <p className="text-gray-600">Kanban-style job pipeline coming soon...</p>
      <p className="text-sm text-gray-500 mt-4">
        This will include the drag-and-drop job board from the MVP
      </p>
    </div>
  );
};

export default JobsBoard;
