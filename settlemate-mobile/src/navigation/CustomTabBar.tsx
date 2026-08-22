import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  tabConfig: Array<{
    name: string;
    title: string;
    icon: any;
    iconOutline: any;
  }>;
  tabBarIconSize: number;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  tabConfig,
  tabBarIconSize,
}) => {
  const { width } = useWindowDimensions();
  const isCompactScreen = width < 360;
  const tabBarVerticalPadding = isCompactScreen ? 6 : 8;
  const tabBarLabelSize = Math.max(9, Math.min(11, Math.round(width * 0.028)));
  const tabBarHeight = Math.max(72, tabBarIconSize + tabBarLabelSize + tabBarVerticalPadding * 2 + 18);

  return (
    <View
      style={[
        styles.container,
        {
          height: tabBarHeight,
          paddingTop: tabBarVerticalPadding,
          paddingBottom: tabBarVerticalPadding,
          paddingHorizontal: 12,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const tab = tabConfig.find((t) => t.name === route.name);
        if (!tab) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            defaultPrevented: false,
          });

          if (!event.defaultPrevented) {
            // Navigate to tab root (e.g. ChatInbox for Chat)
            if (route.name === 'Chat') {
              navigation.navigate('Chat', { screen: 'ChatInbox' });
            } else if (route.name === 'Profile') {
              navigation.navigate('Profile', { screen: 'ProfileHome' });
            } else {
              navigation.navigate(route.name);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconColor = isFocused ? COLORS.primary : COLORS.textMuted;
        const iconName = isFocused ? tab.icon : tab.iconOutline;

        return (
          <TouchableOpacity
            key={`tab-${index}`}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
              <Ionicons name={iconName} size={tabBarIconSize} color={iconColor} />
            </View>
            <View style={styles.labelContainer}>
              <Text
                numberOfLines={1}
                style={[
                  styles.labelText,
                  {
                    fontSize: tabBarLabelSize,
                    color: iconColor,
                  },
                ]}
              >
                {tab.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 6,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(66, 103, 178, 0.1)',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  label: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
