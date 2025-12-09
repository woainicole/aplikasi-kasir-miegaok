import { supabase } from '@/lib/supabase-client';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    BarChart3,
    Calendar,
    CalendarDays,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    Currency,
    Download,
    FileText,
    Filter,
    QrCode,
    Search,
    TrendingUp,
    User,
    Wallet,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { styles } from './_styles';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 15;

// Format Rupiah helper
function formatRupiah(val: number) {
    return `Rp ${Number(val).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

// Format date helper
function formatDate(date: Date) {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// Format date time
function formatDateTime(date: Date) {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Filter types
type FilterType = {
    dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';
    startDate: Date | null;
    endDate: Date | null;
    paymentMethod: string | null;
    searchQuery: string;
};

export default function TransactionsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState<FilterType>({
        dateRange: 'today',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
        paymentMethod: null,
        searchQuery: '',
    });
    
    // Stats
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [averageRevenue, setAverageRevenue] = useState(0);
    
    // Export state
    const [exporting, setExporting] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

    // Fetch orders - TANPA filter user_id
    const fetchOrders = useCallback(
        async (pageToLoad = 0) => {
            pageToLoad === 0 ? setLoading(true) : setLoadingMore(true);

            const from = pageToLoad * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        order_number,
                        total_amount,
                        payment_method,
                        created_at,
                        customer_name,
                        user_id,
                        order_items (
                            id,
                            quantity,
                            price,
                            subtotal,
                            note,
                            products ( name, category )
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (error) throw error;

                if (pageToLoad === 0) {
                    setOrders(data ?? []);
                } else {
                    setOrders(prev => [...prev, ...(data ?? [])]);
                }

                setHasMore((data ?? []).length >= PAGE_SIZE);
            } catch (error) {
                console.error('Error fetching orders:', error);
                Alert.alert('Error', 'Gagal mengambil data transaksi');
            } finally {
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        },
        []
    );

    // Calculate stats
    const calculateStats = useCallback((ordersData: any[]) => {
        const revenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
        const transactions = ordersData.length;
        const average = transactions > 0 ? revenue / transactions : 0;
        
        setTotalRevenue(revenue);
        setTotalTransactions(transactions);
        setAverageRevenue(average);
    }, []);

    useEffect(() => {
        fetchOrders(0);
    }, [fetchOrders]);

    // Apply filters
    useEffect(() => {
        let filtered = [...orders];
        
        // Apply date range filter
        if (filters.startDate && filters.endDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.created_at);
                const start = new Date(filters.startDate!);
                const end = new Date(filters.endDate!);
                
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                
                return orderDate >= start && orderDate <= end;
            });
        }
        
        // Apply payment method filter
        if (filters.paymentMethod) {
            filtered = filtered.filter(order => order.payment_method === filters.paymentMethod);
        }
        
        // Apply search query filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(order => 
                order.order_number.toLowerCase().includes(query) ||
                (order.customer_name?.toLowerCase() || '').includes(query) ||
                order.payment_method.toLowerCase().includes(query)
            );
        }
        
        setFilteredOrders(filtered);
        calculateStats(filtered);
    }, [orders, filters, calculateStats]);

    // Date range presets
    const applyDatePreset = (preset: FilterType['dateRange']) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        switch (preset) {
            case 'today':
                setFilters(prev => ({
                    ...prev,
                    dateRange: 'today',
                    startDate: startDate,
                    endDate: today,
                }));
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                setFilters(prev => ({
                    ...prev,
                    dateRange: 'yesterday',
                    startDate: yesterday,
                    endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999),
                }));
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + 1);
                weekStart.setHours(0, 0, 0, 0);
                setFilters(prev => ({
                    ...prev,
                    dateRange: 'week',
                    startDate: weekStart,
                    endDate: today,
                }));
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setFilters(prev => ({
                    ...prev,
                    dateRange: 'month',
                    startDate: monthStart,
                    endDate: today,
                }));
                break;
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setFilters(prev => ({
                    ...prev,
                    dateRange: 'year',
                    startDate: yearStart,
                    endDate: today,
                }));
                break;
        }
    };

    // Reset filters
    const resetFilters = () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        setFilters({
            dateRange: 'today',
            startDate: startDate,
            endDate: today,
            paymentMethod: null,
            searchQuery: '',
        });
    };

    // Export to real PDF file
    const exportToPDF = async () => {
        if (filteredOrders.length === 0) {
            Alert.alert('Info', 'Tidak ada data untuk diexport');
            return;
        }

        setExporting(true);
        try {
            // Create HTML content for PDF
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Laporan Transaksi</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 20px;
                            line-height: 1.6;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #B82329;
                            padding-bottom: 15px;
                        }
                        .header h1 {
                            color: #B82329;
                            margin: 0;
                            font-size: 24px;
                        }
                        .header .date {
                            color: #666;
                            font-size: 14px;
                            margin-top: 5px;
                        }
                        .summary {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                        }
                        .summary-box {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e9ecef;
                        }
                        .summary-value {
                            font-size: 18px;
                            font-weight: bold;
                            color: #B82329;
                            margin: 10px 0;
                        }
                        .summary-label {
                            font-size: 12px;
                            color: #666;
                            text-transform: uppercase;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th {
                            background-color: #B82329;
                            color: white;
                            padding: 12px;
                            text-align: left;
                            font-size: 14px;
                        }
                        td {
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                            font-size: 13px;
                        }
                        tr:nth-child(even) {
                            background-color: #f8f9fa;
                        }
                        .total-row {
                            font-weight: bold;
                            background-color: #e9ecef !important;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>LAPORAN TRANSAKSI</h1>
                        <div class="date">
                            Periode: ${filters.startDate ? formatDate(filters.startDate) : '-'} - ${filters.endDate ? formatDate(filters.endDate) : '-'}<br>
                            Tanggal Export: ${formatDate(new Date())}
                        </div>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-box">
                            <div class="summary-label">Total Pendapatan</div>
                            <div class="summary-value">${formatRupiah(totalRevenue)}</div>
                        </div>
                        <div class="summary-box">
                            <div class="summary-label">Total Transaksi</div>
                            <div class="summary-value">${totalTransactions}</div>
                        </div>
                        <div class="summary-box">
                            <div class="summary-label">Rata-rata</div>
                            <div class="summary-value">${formatRupiah(averageRevenue)}</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No. Order</th>
                                <th>Tanggal</th>
                                <th>Customer</th>
                                <th>Pembayaran</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredOrders.map((order, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>#${order.order_number}</td>
                                    <td>${formatDateTime(new Date(order.created_at))}</td>
                                    <td>${order.customer_name || 'Customer'}</td>
                                    <td>${order.payment_method}</td>
                                    <td>${formatRupiah(order.total_amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        Laporan ini dibuat secara otomatis oleh aplikasi Mie Gaok<br>
                        ${new Date().toLocaleString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </body>
                </html>
            `;

            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            // Share the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Export Laporan Transaksi',
                    UTI: 'com.adobe.pdf'
                });
            } else {
                Alert.alert(
                    'Export Berhasil',
                    'File PDF telah berhasil dibuat. Anda dapat membukanya di aplikasi PDF viewer.',
                    [
                        { 
                            text: 'OK', 
                            style: 'cancel' 
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Export PDF error:', error);
            Alert.alert('Error', 'Gagal membuat file PDF');
        } finally {
            setExporting(false);
        }
    };

    // Handlers
    const onRefresh = () => {
        setRefreshing(true);
        setHasMore(true);
        fetchOrders(0);
    };

    const loadMore = () => {
        if (!hasMore || loadingMore) return;
        fetchOrders(Math.floor(orders.length / PAGE_SIZE));
    };

    // Date picker
    const showDatePicker = (mode: 'start' | 'end') => {
        setDatePickerMode(mode);
        setDatePickerVisible(true);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setDatePickerVisible(false);
        
        if (selectedDate) {
            setFilters(prev => ({
                ...prev,
                [datePickerMode === 'start' ? 'startDate' : 'endDate']: selectedDate,
                dateRange: 'custom'
            }));
        }
    };

    // Payment method icon
    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'cash': return Wallet;
            case 'qris': return QrCode;
            case 'transfer': return CreditCard;
            case 'debit': return CreditCard;
            default: return CreditCard;
        }
    };

    // Check if has active filters
    const hasActiveFilters = useMemo(() => {
        return (
            !!filters.paymentMethod ||
            !!filters.searchQuery ||
            filters.dateRange !== 'today'
        );
    }, [filters]);

    // Render filter modal
    const FilterModal = () => (
        <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <X size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
                        {/* Date Range Presets */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Periode</Text>
                            <View style={styles.datePresetGrid}>
                                {(['today', 'yesterday', 'week', 'month', 'year'] as const).map(preset => (
                                    <TouchableOpacity
                                        key={preset}
                                        style={[
                                            styles.datePresetBtn,
                                            filters.dateRange === preset && styles.datePresetBtnActive,
                                        ]}
                                        onPress={() => applyDatePreset(preset)}
                                    >
                                        <Text style={[
                                            styles.datePresetText,
                                            filters.dateRange === preset && styles.datePresetTextActive,
                                        ]}>
                                            {preset === 'today' ? 'Hari Ini' : 
                                             preset === 'yesterday' ? 'Kemarin' : 
                                             preset === 'week' ? 'Minggu Ini' : 
                                             preset === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Custom Date Range */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Tanggal Custom</Text>
                            <View style={styles.dateInputContainer}>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => showDatePicker('start')}
                                >
                                    <Calendar size={16} color="#6B7280" />
                                    <Text style={styles.dateInputText}>
                                        {filters.startDate ? formatDate(filters.startDate) : 'Tanggal Mulai'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.dateSeparator}>s/d</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => showDatePicker('end')}
                                >
                                    <Calendar size={16} color="#6B7280" />
                                    <Text style={styles.dateInputText}>
                                        {filters.endDate ? formatDate(filters.endDate) : 'Tanggal Akhir'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Payment Method Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Metode Pembayaran</Text>
                            <View style={styles.paymentMethodGrid}>
                                {['cash', 'qris', 'transfer', 'debit'].map(method => {
                                    const Icon = getPaymentIcon(method);
                                    return (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.paymentMethodChip,
                                                filters.paymentMethod === method && styles.paymentMethodChipActive,
                                            ]}
                                            onPress={() => setFilters(prev => ({
                                                ...prev,
                                                paymentMethod: prev.paymentMethod === method ? null : method,
                                            }))}
                                        >
                                            <Icon size={14} color={filters.paymentMethod === method ? '#FFFFFF' : '#6B7280'} />
                                            <Text style={[
                                                styles.paymentMethodText,
                                                filters.paymentMethod === method && styles.paymentMethodTextActive,
                                            ]}>
                                                {method === 'cash' ? 'Tunai' : 
                                                 method === 'qris' ? 'QRIS' : 
                                                 method === 'transfer' ? 'Transfer' : 'Debit'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.resetButton]}
                            onPress={resetFilters}
                        >
                            <Text style={styles.resetButtonText}>Reset Filter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.applyButton]}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyButtonText}>Terapkan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Render order item
    const OrderItem = ({ order }: { order: any }) => {
        const [expanded, setExpanded] = useState(false);
        const PaymentIcon = getPaymentIcon(order.payment_method);
        const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

        return (
            <View style={styles.orderItem}>
                <TouchableOpacity 
                    style={styles.orderItemHeader}
                    onPress={() => setExpanded(!expanded)}
                    activeOpacity={0.7}
                >
                    <View style={styles.orderInfo}>
                        <View style={styles.orderTopRow}>
                            <Text style={styles.orderNumber}>#{order.order_number}</Text>
                            <Text style={styles.orderAmount}>{formatRupiah(order.total_amount)}</Text>
                        </View>
                        
                        <View style={styles.orderMeta}>
                            <Clock size={12} color="#6B7280" />
                            <Text style={styles.orderDate}>
                                {formatDateTime(new Date(order.created_at))}
                            </Text>
                            <Text style={styles.separator}>•</Text>
                            <User size={12} color="#6B7280" />
                            <Text style={styles.customerName} numberOfLines={1}>
                                {order.customer_name || 'Customer'}
                            </Text>
                            <Text style={styles.separator}>•</Text>
                            <PaymentIcon size={12} color="#6B7280" />
                            <Text style={styles.paymentMethod}>{order.payment_method}</Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.expandButton}
                        onPress={() => setExpanded(!expanded)}
                    >
                        {expanded ? 
                            <ChevronUp size={18} color="#B82329" /> : 
                            <ChevronDown size={18} color="#B82329" />
                        }
                    </TouchableOpacity>
                </TouchableOpacity>

                {expanded && (
                    <View style={styles.orderDetails}>
                        <View style={styles.detailsHeader}>
                            <View style={styles.statusBadge}>
                                <CheckCircle size={12} color="#10B981" />
                                <Text style={styles.statusText}>Selesai</Text>
                            </View>
                            <Text style={styles.itemsCount}>{totalItems} item</Text>
                        </View>
                        
                        <View style={styles.itemsList}>
                            {order.order_items?.map((item: any) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={1}>
                                            {item.products?.name}
                                        </Text>
                                        {item.note && (
                                            <Text style={styles.itemNote} numberOfLines={1}>
                                                📝 {item.note}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.itemAmounts}>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                        <Text style={styles.itemPrice}>{formatRupiah(item.subtotal)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    // Render loading
    if (loading && orders.length === 0) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#B82329" />
                <Text style={styles.loadingText}>Memuat transaksi...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Riwayat Transaksi</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.exportButton}
                            onPress={exportToPDF}
                            disabled={exporting || filteredOrders.length === 0}
                            activeOpacity={0.7}
                        >
                            {exporting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Download size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Range */}
                <Text style={styles.dateRange}>
                    {filters.startDate && filters.endDate && 
                        `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`}
                </Text>

                {/* Stats Summary */}
                <View style={styles.statsSummary}>
                    <View style={styles.statBox}>
                        <Currency size={16} color="#10B981" />
                        <Text style={styles.statValue}>{formatRupiah(totalRevenue)}</Text>
                        <Text style={styles.statLabel}>Total Pendapatan</Text>
                    </View>
                    <View style={styles.statBox}>
                        <BarChart3 size={16} color="#3B82F6" />
                        <Text style={styles.statValue}>{totalTransactions}</Text>
                        <Text style={styles.statLabel}>Transaksi</Text>
                    </View>
                    <View style={styles.statBox}>
                        <TrendingUp size={16} color="#8B5CF6" />
                        <Text style={styles.statValue}>
                            {totalTransactions > 0 ? formatRupiah(averageRevenue) : 'Rp 0'}
                        </Text>
                        <Text style={styles.statLabel}>Rata-rata</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <View style={styles.searchContainer}>
                        <Search size={20} color="#6B7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari transaksi..."
                            value={filters.searchQuery}
                            onChangeText={(text) => setFilters(prev => ({ ...prev, searchQuery: text }))}
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="search"
                        />
                        {filters.searchQuery ? (
                            <TouchableOpacity 
                                onPress={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                                style={styles.clearSearchButton}
                            >
                                <X size={18} color="#6B7280" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => setShowFilterModal(true)}
                        activeOpacity={0.7}
                    >
                        <Filter size={20} color="#B82329" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Filters */}
            {hasActiveFilters && (
                <View style={styles.activeFiltersContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.activeFiltersContent}
                    >
                        {filters.dateRange !== 'today' && (
                            <View style={styles.activeFilterChip}>
                                <CalendarDays size={12} color="#B82329" />
                                <Text style={styles.activeFilterText}>
                                    {filters.dateRange === 'yesterday' ? 'Kemarin' : 
                                     filters.dateRange === 'week' ? 'Minggu Ini' : 
                                     filters.dateRange === 'month' ? 'Bulan Ini' : 
                                     filters.dateRange === 'year' ? 'Tahun Ini' : 'Custom'}
                                </Text>
                            </View>
                        )}
                        
                        {filters.paymentMethod && (
                            <View style={styles.activeFilterChip}>
                                {(() => {
                                    const Icon = getPaymentIcon(filters.paymentMethod);
                                    return <Icon size={12} color="#B82329" />;
                                })()}
                                <Text style={styles.activeFilterText}>
                                    {filters.paymentMethod === 'cash' ? 'Tunai' : 
                                     filters.paymentMethod === 'qris' ? 'QRIS' : 
                                     filters.paymentMethod === 'transfer' ? 'Transfer' : 'Debit'}
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => setFilters(prev => ({ ...prev, paymentMethod: null }))}
                                    style={styles.removeFilterButton}
                                >
                                    <X size={10} color="#B82329" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        {filters.searchQuery && (
                            <View style={styles.activeFilterChip}>
                                <Text style={styles.activeFilterText} numberOfLines={1}>
                                    "{filters.searchQuery}"
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                                    style={styles.removeFilterButton}
                                >
                                    <X size={10} color="#B82329" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <TouchableOpacity 
                            style={styles.clearAllButton}
                            onPress={resetFilters}
                        >
                            <Text style={styles.clearAllText}>Hapus Semua</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <OrderItem order={item} />}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#B82329']}
                        tintColor="#B82329"
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.loadingMore}>
                            <ActivityIndicator size="small" color="#B82329" />
                            <Text style={styles.loadingMoreText}>Memuat...</Text>
                        </View>
                    ) : !hasMore && filteredOrders.length > 0 ? (
                        <View style={styles.listFooter}>
                            <Text style={styles.footerText}>
                                {filteredOrders.length} transaksi ditemukan
                            </Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FileText size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>
                            {orders.length === 0 ? 'Belum Ada Transaksi' : 'Transaksi Tidak Ditemukan'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {orders.length === 0 
                                ? 'Mulai lakukan transaksi pertama Anda' 
                                : 'Coba ubah filter atau kata kunci pencarian'}
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Filter Modal */}
            <FilterModal />

            {/* Android Date Picker */}
            {datePickerVisible && Platform.OS === 'android' && (
                <DateTimePicker
                    value={datePickerMode === 'start' 
                        ? filters.startDate || new Date() 
                        : filters.endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    );
}