import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';
import { Sale } from '@/hooks/useSales';

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated: (sale: Omit<Sale, 'id'>) => void;
}

export const CreateSaleDialog = ({ open, onOpenChange, onSaleCreated }: CreateSaleDialogProps) => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const { salesReturns } = useSalesReturns();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: '',
    customerName: '',
    status: 'Completed' as Sale['status'],
    notes: ''
  });

  // Calculate actual available stock using: Total Purchase + Total Return - Total Sales
  const getCalculatedStock = (productId: string) => {
    const productSales = sales.filter(sale => sale.productId === productId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId);
    const productReturns = salesReturns.filter(returnItem => returnItem.productId === productId);
    
    const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalReturned = productReturns.reduce((sum, returnItem) => sum + returnItem.returnQuantity, 0);
    
    return totalPurchased + totalReturned - totalSold;
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = formData.unitPrice ? parseFloat(formData.unitPrice) : 0;
  const totalAmount = unitPrice * formData.quantity;
  const availableStock = selectedProduct ? getCalculatedStock(selectedProduct.id) : 0;
  const isQuantityValid = formData.quantity <= availableStock;

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unitPrice: product ? product.sellPrice.replace(/[$৳]/g, '') : '',
      quantity: 1 // Reset quantity when product changes
    });
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    setFormData({
      ...formData,
      quantity: Math.min(newQuantity, availableStock) // Limit to available stock
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formData.unitPrice || !isQuantityValid) return;

    const saleData: Omit<Sale, 'id'> = {
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      unitPrice: `${parseFloat(formData.unitPrice).toFixed(2)}`,
      totalAmount: `${totalAmount.toFixed(2)}`,
      date: new Date().toISOString().split('T')[0],
      status: formData.status,
      customerName: formData.customerName,
      notes: formData.notes
    };

    onSaleCreated(saleData);
    onOpenChange(false);
    setFormData({
      productId: '',
      quantity: 1,
      unitPrice: '',
      customerName: '',
      status: 'Completed',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select value={formData.productId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const calculatedStock = getCalculatedStock(product.id);
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.sellPrice} (Stock: {calculatedStock})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-sm text-gray-600">
                  Available Stock: <span className="font-medium">{availableStock}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={availableStock}
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                className={!isQuantityValid ? 'border-red-500' : ''}
              />
              {!isQuantityValid && (
                <p className="text-sm text-red-600">
                  Quantity cannot exceed available stock ({availableStock})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (৳) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Sale['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.unitPrice && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sale Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Unit Price:</span> ৳{parseFloat(formData.unitPrice).toFixed(2)}
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span> {formData.quantity}
                </div>
                <div className="col-span-2 text-lg font-semibold">
                  <span className="text-gray-600">Total Amount:</span> ৳{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this sale..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.productId || !formData.unitPrice || !isQuantityValid}
            >
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
