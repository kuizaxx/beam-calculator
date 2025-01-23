import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <h1>Chọn sơ đồ tính</h1>
      <ul>
        <li>
          <Link href="/beam1/" className="beam-link">
          <Image
              src="/images/beam1-thumbnail.png"
              alt="Dầm đơn giản, gối 2 đầu, tải phân bố đều"
              width={400}  // Điều chỉnh kích thước theo ý muốn
              height={200} // Điều chỉnh kích thước theo ý muốn
            />
            <span>Dầm đơn giản, gối 2 đầu, tải phân bố đều</span>
          </Link>
        </li>
        <li>
          <Link href="/beam2/" className="beam-link">
          <Image
              src="/images/beam2-thumbnail.png"
              alt="Dầm ngàm một đầu chịu tải trọng phân bố đều"
              width={400} // Điều chỉnh kích thước theo ý muốn
              height={200} // Điều chỉnh kích thước theo ý muốn
            />
            <span>Dầm ngàm một đầu chịu tải trọng phân bố đều</span>
          </Link>
        </li>
        <li>
          <Link href="/beam3/" className="beam-link">
          <Image
              src="/images/beam3-thumbnail.png"
              alt="Dầm đơn giản, tải trọng tập trung tại giữa dầm"
              width={400} // Điều chỉnh kích thước theo ý muốn
              height={200} // Điều chỉnh kích thước theo ý muốn
            />
            <span>Dầm đơn giản, tải trọng tập trung tại giữa dầm</span>
          </Link>
        </li>
        <li>
          <Link href="/beam4/" className="beam-link">
          <Image
              src="/images/beam4-thumbnail.png"
              alt="Dầm ngàm một đầu chịu tải trọng tập trung"
              width={400} // Điều chỉnh kích thước theo ý muốn
              height={200} // Điều chỉnh kích thước theo ý muốn
            />
            <span>Dầm ngàm một đầu chịu tải trọng tập trung</span>
          </Link>
        </li>
      </ul>
    </main>
  );
}