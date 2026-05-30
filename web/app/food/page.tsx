import { PassengerPortalPage } from '../../components/passenger-portal-page';

export const metadata = {
  title: 'Food Delivery | Drive',
  description: 'Order food from local restaurants and track your delivery in real time.',
};

export default function FoodPage() {
  return <PassengerPortalPage section="food" />;
}
