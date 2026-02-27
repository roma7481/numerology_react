import {
    initConnection,
    endConnection,
    fetchProducts,
    requestPurchase,
    restorePurchases,
    finishTransaction,
    purchaseUpdatedListener,
    purchaseErrorListener,
    type Product,
    type Purchase,
    type PurchaseError,
} from 'react-native-iap';
import { useStore } from '../store/useStore';

const PRODUCT_IDS = [
    'numerology_premium',
    'compatibility_numerology',
    'numerology_profiles',
    'numerology_no_ads',
];

class PurchaseService {
    private products: Product[] = [];
    private purchaseUpdateSubscription: any = null;
    private purchaseErrorSubscription: any = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        try {
            await initConnection();
            console.log('IAP connection initialized');

            // Fetch products from Google Play
            const result = await fetchProducts({ skus: PRODUCT_IDS });
            if (result) {
                this.products = result as Product[];
            }
            console.log('IAP products loaded:', this.products.length);

            // Listen for purchase updates
            this.purchaseUpdateSubscription = purchaseUpdatedListener(
                async (purchase: Purchase) => {
                    const productId = purchase.productId;
                    console.log('Purchase updated:', productId);
                    const { setPurchase } = useStore.getState();
                    setPurchase(productId, true);

                    // If premium, also unlock all sub-features
                    if (productId === 'numerology_premium') {
                        setPurchase('compatibility_numerology', true);
                        setPurchase('numerology_profiles', true);
                        setPurchase('numerology_no_ads', true);
                    }

                    await finishTransaction({ purchase, isConsumable: false });
                    console.log('Transaction finished:', productId);
                }
            );

            this.purchaseErrorSubscription = purchaseErrorListener(
                (error: PurchaseError) => {
                    console.warn('Purchase error:', error.code, error.message);
                }
            );

            // Restore previous purchases on init
            await this.restore();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize IAP:', error);
        }
    }

    getProducts(): Product[] {
        return this.products;
    }

    getProduct(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    async purchase(productId: string): Promise<void> {
        try {
            await requestPurchase({
                type: 'in-app',
                request: {
                    google: {
                        skus: [productId],
                    },
                },
            });
        } catch (error) {
            console.error('Purchase request error:', error);
            throw error;
        }
    }

    async restore(): Promise<void> {
        try {
            await restorePurchases();
            console.log('Restore purchases triggered');
            // The purchaseUpdatedListener will fire for each restored purchase
        } catch (error) {
            console.error('Restore purchases error:', error);
        }
    }

    async destroy() {
        this.purchaseUpdateSubscription?.remove();
        this.purchaseErrorSubscription?.remove();
        await endConnection();
        this.initialized = false;
    }
}

export const purchaseService = new PurchaseService();
