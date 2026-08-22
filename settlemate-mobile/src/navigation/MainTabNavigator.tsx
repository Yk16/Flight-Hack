import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { CustomTabBar } from './CustomTabBar';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { MyPropertiesScreen } from '../screens/MyPropertiesScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { AddServiceScreen } from '../screens/AddServiceScreen';
import { AddHouseScreen } from '../screens/AddHouseScreen';
import { HouseDetailsScreen } from '../screens/HouseDetailsScreen';
import { ServiceDetailsScreen } from '../screens/ServiceDetailsScreen';
import { FlatmateViewProfileScreen } from '../screens/FlatmateViewProfileScreen';

const Tab = createBottomTabNavigator();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  component: React.ComponentType<any>;
  title: string;
  headerShown?: boolean;
  icon: TabIconName;
  iconOutline: TabIconName;
};

export const MainTabNavigator = () => {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  const isVerifiedOwner = Boolean(user?.isOwner && user?.status === 'VERIFIED');
  const isAdmin = Boolean(user?.isAdmin);
  const isCompactScreen = width < 360;

  const tabBarIconSize = Math.max(24, Math.min(30, Math.round(width * 0.075)));
  const tabBarLabelSize = Math.max(9, Math.min(11, Math.round(width * 0.028)));
  const tabBarVerticalPadding = isCompactScreen ? 6 : 8;
  const tabBarHeight = Math.max(72, tabBarIconSize + tabBarLabelSize + tabBarVerticalPadding * 2 + 18);

  const visibleTabs: TabConfig[] = [
    {
      name: 'Home',
      component: HomeScreen,
      title: 'Home',
      headerShown: false,
      icon: 'home' as const,
      iconOutline: 'home-outline' as const,
    },
    {
      name: 'Services',
      component: ServicesScreen,
      title: 'Services',
      headerShown: false,
      icon: 'briefcase' as const,
      iconOutline: 'briefcase-outline' as const,
    },
    {
      name: 'Chat',
      component: ChatNavigator,
      title: 'Chat',
      headerShown: false,
      icon: 'chatbubbles' as const,
      iconOutline: 'chatbubbles-outline' as const,
    },
    {
      name: 'Profile',
      component: ProfileNavigator,
      title: 'Profile',
      headerShown: false,
      icon: 'person' as const,
      iconOutline: 'person-outline' as const,
    },
  ];

  if (isVerifiedOwner) {
    visibleTabs.push({
      name: 'Property Listing',
      component: MyPropertiesScreen,
      title: 'Property',
      icon: 'storefront' as const,
      iconOutline: 'storefront-outline' as const,
    });
  }

  if (isAdmin) {
    visibleTabs.push({
      name: 'Admin',
      component: AdminUsersScreen,
      title: 'Admin',
      icon: 'shield' as const,
      iconOutline: 'shield-outline' as const,
    });
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          tabConfig={visibleTabs}
          tabBarIconSize={tabBarIconSize}
        />
      )}
    >
      {visibleTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            headerShown: tab.headerShown ?? true,
            title: tab.name === 'Services' ? '' : tab.title,
          }}
        />
      ))}

      {/* Hidden Screens (Navigable but no tab button) */}
      <Tab.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{
          tabBarButton: () => null,
          title: 'Add Service',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddHouse"
        component={AddHouseScreen}
        options={{
          tabBarButton: () => null,
          title: 'Add House',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="HouseDetails"
        component={HouseDetailsScreen}
        options={{
          tabBarButton: () => null,
          title: 'Property Details',
          headerShown: false,
          header: () => null,
        }}
      />
      <Tab.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{
          tabBarButton: () => null,
          title: 'Service Details',
          headerShown: false,
          header: () => null,
        }}
      />
      <Tab.Screen
        name="FlatmateViewProfile"
        component={FlatmateViewProfileScreen}
        options={{
          tabBarButton: () => null,
          title: 'Flatmate Profile',
          headerShown: false,
          header: () => null,
        }}
      />
    </Tab.Navigator>
  );
};
