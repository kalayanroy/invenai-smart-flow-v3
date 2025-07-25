
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  customerName?: string;
  notes?: string;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      console.log('Fetching sales from Supabase...');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
        return;
      }

      console.log('Raw sales data from Supabase:', data);

      const mappedSales = data.map(sale => ({
        id: sale.id,
        productId: sale.product_id,
        productName: sale.product_name,
        quantity: sale.quantity,
        unitPrice: sale.unit_price,
        totalAmount: sale.total_amount,
        date: sale.date,
        status: sale.status as 'Completed' | 'Pending' | 'Cancelled',
        customerName: sale.customer_name,
        notes: sale.notes
      }));

      console.log('Mapped sales:', mappedSales);
      setSales(mappedSales);
    } catch (error) {
      console.error('Error in fetchSales:', error);
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      console.log('Adding sale to Supabase:', saleData);

      const newSale = {
        id: `SALE${String(sales.length + 1).padStart(3, '0')}`,
        product_id: saleData.productId,
        product_name: saleData.productName,
        quantity: saleData.quantity,
        unit_price: saleData.unitPrice,
        total_amount: saleData.totalAmount,
        date: saleData.date,
        status: saleData.status,
        customer_name: saleData.customerName || null,
        notes: saleData.notes || null
      };

      console.log('Prepared sale data for Supabase:', newSale);

      const { data, error } = await supabase
        .from('sales')
        .insert([newSale])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding sale:', error);
        throw error;
      }

      console.log('Sale successfully added to Supabase:', data);
      await fetchSales(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addSale:', error);
      throw error;
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      console.log('Updating sale in Supabase:', id, updates);
      
      const dbUpdates: any = {};
      
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.productName) dbUpdates.product_name = updates.productName;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice;
      if (updates.totalAmount) dbUpdates.total_amount = updates.totalAmount;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('sales')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating sale:', error);
        throw error;
      }

      console.log('Sale updated successfully in Supabase');
      await fetchSales(); // Refresh the list
    } catch (error) {
      console.error('Error in updateSale:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      console.log('Deleting sale from Supabase:', id);
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting sale:', error);
        throw error;
      }

      console.log('Sale deleted successfully from Supabase');
      await fetchSales(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteSale:', error);
      throw error;
    }
  };

  const clearAllSales = async () => {
    try {
      console.log('Clearing all sales from Supabase...');
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Supabase error clearing sales:', error);
        throw error;
      }

      console.log('All sales cleared from Supabase');
      setSales([]);
    } catch (error) {
      console.error('Error in clearAllSales:', error);
      throw error;
    }
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    clearAllSales,
    fetchSales
  };
};
