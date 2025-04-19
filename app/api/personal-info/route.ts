import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// Create table if it doesn't exist
const initTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS personal_info (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      clothing_size VARCHAR(10) NOT NULL,
      shoe_size INTEGER NOT NULL,
      favorite_colors TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
};

export async function POST(req: Request) {
  try {
    await initTable();
    const data = await req.json();
    
    // Check if record exists
    const existingRecord = await sql`
      SELECT id FROM personal_info 
      WHERE first_name = ${data.firstName} 
      AND last_name = ${data.lastName}
      LIMIT 1
    `;

    if (existingRecord.length > 0) {
      // Update existing record
      await sql`
        UPDATE personal_info 
        SET 
          clothing_size = ${data.clothingSize},
          shoe_size = ${parseInt(data.shoeSize)},
          favorite_colors = ${data.favoriteColors},
          updated_at = NOW()
        WHERE id = ${existingRecord[0].id}
      `;
    } else {
      // Insert new record
      await sql`
        INSERT INTO personal_info (
          first_name, 
          last_name, 
          clothing_size, 
          shoe_size, 
          favorite_colors
        ) VALUES (
          ${data.firstName},
          ${data.lastName},
          ${data.clothingSize},
          ${parseInt(data.shoeSize)},
          ${data.favoriteColors}
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await initTable();
    const url = new URL(req.url);
    const firstName = url.searchParams.get('firstName');
    const lastName = url.searchParams.get('lastName');

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const data = await sql`
      SELECT * FROM personal_info 
      WHERE first_name = ${firstName} 
      AND last_name = ${lastName}
      LIMIT 1
    `;

    return NextResponse.json(data[0] || null);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}