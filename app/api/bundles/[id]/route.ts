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
        const { network, name, size, price, isActive, audience } = body;
        const updatedName = name || size;

        await dbConnect();

        const updateData: any = {};
        if (network !== undefined) updateData.network = network;
        if (updatedName !== undefined) updateData.name = updatedName;
        if (price !== undefined) updateData.price = price;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (audience !== undefined) updateData.audience = audience;

        const bundle = await Bundle.findByIdAndUpdate(
            id,
            updateData,
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
