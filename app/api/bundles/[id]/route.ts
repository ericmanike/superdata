import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Bundle from '@/lib/models/Bundle';

// UPDATE bundle
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { network, name, price, isActive } = body;

        await dbConnect();

        const bundle = await Bundle.findByIdAndUpdate(
            id,
            { network, name, price, isActive },
            { new: true, runValidators: true }
        );

        if (!bundle) {
            return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
        }

        console.log('✅ Bundle updated:', bundle.name);

        return NextResponse.json(bundle);
    } catch (error) {
        console.error('Error updating bundle:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE bundle
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const bundle = await Bundle.findByIdAndDelete(id);

        if (!bundle) {
            return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
        }

        console.log('🗑️ Bundle deleted:', bundle.name);

        return NextResponse.json({ message: 'Bundle deleted successfully' });
    } catch (error) {
        console.error('Error deleting bundle:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
