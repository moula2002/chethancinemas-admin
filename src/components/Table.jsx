export default function Table() {
  const rows = [
    { id: 1, movie: "Avatar: Way of Water", date: "2025-12-01", tickets: 120 },
    { id: 2, movie: "Dune: Part Two", date: "2025-12-03", tickets: 95 },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Movie</th>
            <th className="p-2">Date</th>
            <th className="p-2">Tickets</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="p-2">{row.id}</td>
              <td className="p-2">{row.movie}</td>
              <td className="p-2">{row.date}</td>
              <td className="p-2">{row.tickets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
