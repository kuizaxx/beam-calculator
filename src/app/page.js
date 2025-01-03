import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Chọn sơ đồ tính</h1>
      <ul>
        <li>
          <Link href="/simple-beam">
            Dầm đơn giản, gối 2 đầu, tải phân bố đều
          </Link>
        </li>
        {/* Thêm các sơ đồ khác sau */}
      </ul>
    </main>
  );
}