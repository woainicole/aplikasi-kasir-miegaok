import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

// MIE GAOK COLOR PALETTE
const COLORS = {
  primary: '#B82329',     // Merah Gelap (mangkuk)
  secondary: '#F5A835',   // Orange Cerah (background utama)
  white: '#FFFFFF',       // Putih (mie dan tulisan)
  black: '#000000',       // Hitam (sumpit)
  
  // Additional Colors
  background: '#F9FAFB',
  lightGray: '#F3F4F6',
  gray: '#6B7280',
  darkGray: '#374151',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
};

// SPACING SYSTEM (Consistent across all components)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

// TYPOGRAPHY SYSTEM
export const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 14, fontWeight: '600' as const },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header Styles
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? SPACING['4xl'] : SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterToggleBtn: {
    padding: SPACING.sm,
  },
  refreshBtn: {
    padding: SPACING.sm,
  },
  cartBadge: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  badgeCount: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  badgeText: {
    color: COLORS.white,
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.black,
  },
  clearSearchBtn: {
    padding: SPACING.xs,
  },
  
  // Category Filter Panel
  filterPanel: {
    marginBottom: SPACING.md,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: COLORS.secondary + '20',
    borderColor: COLORS.secondary,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  categoryTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.danger + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
  },
  clearFiltersText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '500',
  },
  
  // Filter Summary
  filterSummary: {
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  filterSummaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
  },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Products Styles
  productsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  productList: {
    paddingBottom: SPACING['3xl'],
  },
  productCard: {
    width: isSmallScreen ? (width / 2) - (SPACING.lg + SPACING.xs) : (width / 2) - (SPACING.lg + SPACING.xs),
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    marginBottom: SPACING.sm,
  },
  productName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  productPrice: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addToCartBtn: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  
  // Cart Styles
  cartContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cartScrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cartItemInfo: {
    marginBottom: SPACING.md,
  },
  cartItemName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  cartItemPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    padding: SPACING.xs,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  qtyText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.black,
    marginHorizontal: SPACING.md,
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemSubtotal: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    padding: SPACING.sm,
  },
  
  // Customer Input
  customerInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  customerHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  customerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  clearCustomerBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  
  // Payment Methods
  paymentSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  paymentMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  paymentMethodTextActive: {
    color: COLORS.white,
  },
  
  // Cart Summary
  cartSummary: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: SPACING.lg,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.black,
  },
  totalLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.black,
  },
  totalValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cartActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  clearCartBtn: {
    backgroundColor: COLORS.danger + '10',
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
  },
  clearCartBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.danger,
    fontWeight: '600',
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
  },
  checkoutBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING['3xl'],
  },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING['3xl'],
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  clearFilterButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clearFilterButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  browseProductsBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  browseProductsText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default {};
