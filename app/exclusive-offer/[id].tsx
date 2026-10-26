import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import {
  findExclusiveOffer,
  getExclusiveOfferForTheme,
  resolveOfferArt,
  iconForOfferKind,
  type ExclusiveOffer,
} from '../../src/data/exclusiveOffers'
import { useAdaptiveUI } from '../../src/context/AdaptiveUIContext'
import StandaloneTabBar from '../../src/components/StandaloneTabBar'
import { C, R, typeHeadline } from '../../src/theme'
import { shareText } from '../../src/utils/share'

function PerkRow({ text }: { text: string }) {
  return (
    <View style={s.perkRow}>
      <Ionicons name="checkmark-circle" size={16} color={C.cyan} />
      <Text style={s.perkText}>{text}</Text>
    </View>
  )
}

function RelatedOfferCard({ offer, onPress }: { offer: ExclusiveOffer; onPress: () => void }) {
  const art = resolveOfferArt(offer.heroArtKey)
  return (
    <TouchableOpacity style={s.relatedCard} activeOpacity={0.85} onPress={onPress}>
      {art ? (
        <Image source={art} style={s.relatedArt} resizeMode="cover" />
      ) : (
        <View style={[s.relatedArt, { backgroundColor: offer.heroHue }]}>
          <Ionicons name={iconForOfferKind(offer.kind) as any} size={22} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <View style={s.relatedBadge}>
        <Text style={s.relatedBadgeText}>{offer.badge}</Text>
      </View>
      <Text style={s.relatedTitle} numberOfLines={2}>{offer.title}</Text>
      <Text style={s.relatedSub} numberOfLines={1}>{offer.subtitle}</Text>
    </TouchableOpacity>
  )
}

export default function ExclusiveOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { showConfirmation, activeTheme } = useAdaptiveUI()
  const offer =
    findExclusiveOffer(id) ??
    getExclusiveOfferForTheme(activeTheme?.id, activeTheme?.heroArtistId, activeTheme?.label)
  const art = resolveOfferArt(offer.heroArtKey)
  const [claimed, setClaimed] = useState(false)

  const related = (offer.relatedOfferIds ?? [])
    .map(oid => findExclusiveOffer(oid))
    .filter((o): o is ExclusiveOffer => o != null)

  const handleShare = () => {
    void shareText(`Check out this superfan perk: ${offer.title}`)
  }

  const handleClaim = () => {
    if (claimed) {
      showConfirmation('Already claimed — check your inbox')
      return
    }
    setClaimed(true)
    showConfirmation(`${offer.ctaLabel} — offer saved to your perks`)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Superfan perks</Text>
        <TouchableOpacity style={s.iconBtn} accessibilityLabel="Share" onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LinearGradient
          colors={[offer.heroHue + '88', offer.heroHue + '33', C.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroBadgeRow}>
            <View style={s.kindPill}>
              <Ionicons name={iconForOfferKind(offer.kind) as any} size={13} color={C.cyan} />
              <Text style={s.kindPillText}>{offer.unlockReason}</Text>
            </View>
            <View style={s.discountBadge}>
              <Text style={s.discountBadgeText}>{offer.badge}</Text>
            </View>
          </View>

          <View style={s.coverShadow}>
            {art ? (
              <Image source={art} style={s.cover} resizeMode="cover" />
            ) : (
              <View style={[s.cover, { backgroundColor: offer.heroHue, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name={iconForOfferKind(offer.kind) as any} size={54} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </View>

          <Text style={s.artistName}>{offer.artistName}</Text>
          <Text style={s.title} numberOfLines={3}>{offer.title}</Text>
          <Text style={s.subtitle}>{offer.subtitle}</Text>

          {(offer.originalPrice || offer.discountedPrice) && (
            <View style={s.priceRow}>
              {offer.originalPrice ? <Text style={s.originalPrice}>{offer.originalPrice}</Text> : null}
              {offer.discountedPrice ? <Text style={s.discountedPrice}>{offer.discountedPrice}</Text> : null}
              {offer.expiresLabel ? <Text style={s.expiresText}> · {offer.expiresLabel}</Text> : null}
            </View>
          )}
          {!offer.originalPrice && offer.expiresLabel ? (
            <Text style={s.expiresOnly}>{offer.expiresLabel}</Text>
          ) : null}

          <TouchableOpacity
            style={[s.ctaBtn, claimed && s.ctaBtnClaimed]}
            activeOpacity={0.85}
            onPress={handleClaim}
          >
            <Ionicons
              name={claimed ? 'checkmark-circle' : iconForOfferKind(offer.kind) as any}
              size={18}
              color={claimed ? C.cyan : C.bg}
            />
            <Text style={[s.ctaText, claimed && s.ctaTextClaimed]}>
              {claimed ? 'Claimed' : offer.ctaLabel}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.sectionTitle}>About this perk</Text>
          <Text style={s.about}>{offer.description}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>What you get</Text>
          <View style={s.perkList}>
            {offer.perks.map(perk => (
              <PerkRow key={perk} text={perk} />
            ))}
          </View>
        </View>

        {related.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>More perks for you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
              {related.map(rel => (
                <RelatedOfferCard
                  key={rel.id}
                  offer={rel}
                  onPress={() => router.push(`/exclusive-offer/${rel.id}` as any)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <StandaloneTabBar />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  hero: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, alignItems: 'center' },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  kindPillText: { fontSize: 11, fontWeight: '700', color: C.cyan, letterSpacing: 0.3 },
  discountBadge: {
    backgroundColor: C.cyan,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountBadgeText: { fontSize: 12, fontWeight: '800', color: C.bg, letterSpacing: 0.5 },
  coverShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 18,
  },
  cover: { width: 200, height: 200, borderRadius: R.md },
  artistName: { fontSize: 12, fontWeight: '700', color: C.cyan, letterSpacing: 0.6, marginBottom: 4 },
  title: { ...typeHeadline(24), color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  originalPrice: { fontSize: 15, color: C.textMuted, textDecorationLine: 'line-through', marginRight: 8 },
  discountedPrice: { fontSize: 20, fontWeight: '800', color: '#fff' },
  expiresText: { fontSize: 12, color: C.textMuted },
  expiresOnly: { fontSize: 12, color: C.textMuted, marginBottom: 16 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.cyan,
    borderRadius: 100,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
  },
  ctaBtnClaimed: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: C.cyan,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: C.bg },
  ctaTextClaimed: { color: C.cyan },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { ...typeHeadline(18), color: '#fff', marginBottom: 12 },
  about: { fontSize: 15, color: C.textSecondary, lineHeight: 22 },
  perkList: { gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  perkText: { flex: 1, fontSize: 14, color: '#fff', lineHeight: 20 },
  rail: { gap: 14, paddingRight: 20 },
  relatedCard: { width: 140 },
  relatedArt: { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden' },
  relatedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.cyan,
  },
  relatedBadgeText: { fontSize: 9, fontWeight: '800', color: C.cyan, letterSpacing: 0.4 },
  relatedTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 8 },
  relatedSub: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
})
