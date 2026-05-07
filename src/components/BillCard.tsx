import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bill, Draft } from '../types';
import { Colors, Radius, Spacing, FontSize } from '../theme/colors';
import { FileText, Clock } from 'lucide-react-native';

interface Props {
  data: Bill | Draft;
  onPress: () => void;
  isDraft?: boolean;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BillCard({ data, onPress, isDraft = false }: Props) {
  const total = data.total ?? data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={Colors.gradientCard as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.idContainer}>
            {isDraft ? (
              <Clock size={16} color={Colors.warning} style={styles.icon} />
            ) : (
              <FileText size={16} color={Colors.accent} style={styles.icon} />
            )}
            <Text style={styles.idText}>
              {isDraft ? 'DRAFT' : `#${data.id.slice(-6).toUpperCase()}`}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(data.created_at)}</Text>
        </View>

        <View style={styles.body}>
          <View>
            <Text style={styles.customerName}>
              {data.customer_name || 'Walk-in Customer'}
            </Text>
            <Text style={styles.itemsCount}>
              {data.items.length} item{data.items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={[styles.amount, isDraft && { color: Colors.warning }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  icon: {
    marginRight: 6,
  },
  idText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  customerName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemsCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
});
