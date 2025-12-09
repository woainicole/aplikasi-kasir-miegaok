import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

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
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SPACING.sm,
        ...TYPOGRAPHY.body,
        color: COLORS.gray,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? SPACING['4xl'] : SPACING['2xl'],
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.primary,
    },
    dateRange: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        marginBottom: SPACING.lg,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    filterButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: COLORS.secondary + '20', // 20% opacity
    },
    exportButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: COLORS.primary,
    },
    statsSummary: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary + '15', // 15% opacity
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.secondary + '30', // 30% opacity
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: SPACING.xs,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        textAlign: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
        color: COLORS.black,
        padding: 0,
        marginLeft: SPACING.sm,
    },
    clearSearchButton: {
        padding: SPACING.xs,
    },
    // Active Filters - More Compact
    activeFiltersContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    activeFiltersContent: {
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        minHeight: 32,
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.secondary + '20', // 20% opacity
        borderRadius: 16,
        marginRight: SPACING.sm,
        height: 28,
        borderWidth: 1,
        borderColor: COLORS.secondary + '40', // 40% opacity
    },
    activeFilterText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontWeight: '500',
        maxWidth: 100,
    },
    removeFilterButton: {
        marginLeft: SPACING.xs,
        padding: SPACING.xs,
    },
    clearAllButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.danger + '10', // 10% opacity
        borderRadius: 16,
        height: 28,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.danger + '20', // 20% opacity
    },
    clearAllText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.danger,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    orderItem: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    orderItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    orderInfo: {
        flex: 1,
    },
    orderTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    orderNumber: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.black,
    },
    orderAmount: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.primary,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    orderDate: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
    },
    customerName: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        maxWidth: 80,
    },
    paymentMethod: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
    },
    separator: {
        fontSize: 10,
        color: '#D1D5DB',
        marginHorizontal: SPACING.xs,
    },
    expandButton: {
        padding: SPACING.xs,
    },
    orderDetails: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.success + '20',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.success + '40',
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.success,
        fontWeight: '500',
    },
    itemsCount: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
    },
    itemsList: {
        gap: SPACING.sm,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    itemInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    itemName: {
        ...TYPOGRAPHY.body,
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    itemNote: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    itemAmounts: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    itemQuantity: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        minWidth: 30,
    },
    itemPrice: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.black,
        minWidth: 80,
        textAlign: 'right',
    },
    loadingMore: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.xl,
    },
    loadingMoreText: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray,
    },
    listFooter: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        marginTop: SPACING.sm,
    },
    footerText: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['4xl'],
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.black,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
        ...TYPOGRAPHY.h3,
        fontWeight: '700',
        color: COLORS.black,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    filterContent: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    filterSection: {
        marginBottom: SPACING.xl,
    },
    filterSectionTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.md,
    },
    datePresetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    datePresetBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        minWidth: 80,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    datePresetBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    datePresetText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        fontWeight: '500',
        textAlign: 'center',
    },
    datePresetTextActive: {
        color: COLORS.white,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateInputText: {
        ...TYPOGRAPHY.body,
        color: COLORS.darkGray,
    },
    dateSeparator: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray,
        fontWeight: '500',
    },
    paymentMethodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    paymentMethodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        minWidth: 80,
    },
    paymentMethodChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    paymentMethodText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray,
        fontWeight: '500',
    },
    paymentMethodTextActive: {
        color: COLORS.white,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: COLORS.lightGray,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    resetButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: COLORS.primary,
    },
    applyButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
        fontWeight: '600',
    },
});

export default {};
