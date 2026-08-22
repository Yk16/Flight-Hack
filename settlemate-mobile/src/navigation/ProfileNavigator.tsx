import { ProviderBookingsScreen } from '../screens/ProviderBookingsScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen';
import { FlatmateProfileScreen } from '../screens/FlatmateProfileScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import OwnerKycScreen from '../screens/OwnerKycScreen';
import ProviderKycScreen from '../screens/ProviderKycScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { UpgradeRequestScreen } from '../screens/UpgradeRequestScreen';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="FlatmateProfile" component={FlatmateProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="OwnerKyc" component={OwnerKycScreen} />
      <Stack.Screen name="ProviderKyc" component={ProviderKycScreen} />
      <Stack.Screen name="ProviderBookings" component={ProviderBookingsScreen} />
      <Stack.Screen name="AdminServiceProviders" component={AdminUsersScreen} />
      <Stack.Screen name="UpgradeRequest" component={UpgradeRequestScreen} />
    </Stack.Navigator>
  );
};
