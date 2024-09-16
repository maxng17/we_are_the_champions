// import { useState } from "react";

// interface AddTeamsModalProps {
//     visible: boolean,
//     onClose: () => void;
// }

// export default function AddTeamsModal({onClose}: AddTeamsModalProps) {
//     const [input, setInput] = useState('');
//     const [error, setError] = useState('');

//     const handleSubmit = async () => {
//         try {
//             console.log(input)
            
//         } catch (err) {
//             if (err instanceof Error) {
//                 setError(err.message);
//             } else {
//                 setError('An unexpected error occurred');
//             }
//         }
//     }

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
//             <div className="w-[600px] bg-white rounded flex flex-col">
//                 <h2>Add Team Details</h2>
//                 <textarea 
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     rows={12}
//                     placeholder="Enter teams data here in the format <Team name> <Registration date> <Team Group Number> eg: team1 01/01 1"
//                     className="rounded-lg w-full p-4 mt-2 text-lg"
//                 />
//                 {error && <p className="text-red-500 mt-2">{error}</p>}
//                 <div className="flex justify-end mt-4">
//                     <button onClick={handleSubmit} >Submit</button>
//                     <button onClick={onClose} >Cancel</button>
//                 </div>
//             </div>
//         </div>
//     )
// }
