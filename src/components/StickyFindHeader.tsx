import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from './AppText'
import { C, R } from '../theme'

export const FIND_SEARCH_BAR_HEIGHT = 46
export const FIND_FIXED_HEADER_BOTTOM_PAD = 8

type SearchBarProps = {
  focused: boolean
  query: string
  onChangeText: (text: string) => void
  onFocus: () => void
  onBlur: () => void
  onClear: () => void
}

export function useFindFixedHeaderHeight() {
  const insets = useSafeAreaInsets()
  return insets.top + FIND_SEARCH_BAR_HEIGHT + FIND_FIXED_HEADER_BOTTOM_PAD
}

export function FindSearchBar({
  focused,
  query,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
}: SearchBarProps) {
  return (
    <View style={[s.searchBar, focused && s.searchBarFocused]}>
      <Ionicons name="search" size={18} color={focused ? C.cyanBright : '#666666'} />
      <TextInput
        style={s.searchInput}
        placeholder="What do you want to listen to?"
        placeholderTextColor="#555555"
        value={query}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color="#888888" />
        </TouchableOpacity>
      )}
    </View>
  )
}

type FixedSearchProps = SearchBarProps

export default function StickyFindHeader(props: FixedSearchProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.fixedWrapper, { paddingTop: insets.top }]}>
      <FindSearchBar {...props} />
    </View>
  )
}

const s = StyleSheet.create({
  fixedWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: C.bg,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: FIND_SEARCH_BAR_HEIGHT,
  },
  searchBarFocused: { borderWidth: 2, borderColor: C.cyanBright },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a1a', padding: 0 },
})
