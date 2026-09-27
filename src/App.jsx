import { Route, Routes } from 'react-router-dom'
import { SiteProvider } from './site'
import { Toaster } from './components/ui'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/public/Home'
import Listings from './pages/public/Listings'
import ListingDetail from './pages/public/ListingDetail'
import Posts from './pages/public/Posts'
import PostDetail from './pages/public/PostDetail'
import Contact from './pages/public/Contact'
import NotFound from './pages/public/NotFound'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ListingsAdmin from './pages/admin/ListingsAdmin'
import ListingEdit from './pages/admin/ListingEdit'
import PostsAdmin from './pages/admin/PostsAdmin'
import PostEdit from './pages/admin/PostEdit'
import Clients from './pages/admin/Clients'
import Inquiries from './pages/admin/Inquiries'
import Settings from './pages/admin/Settings'

export default function App() {
  return (
    <SiteProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingDetail />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="listings" element={<ListingsAdmin key="active" />} />
          <Route path="completed" element={<ListingsAdmin key="done" done />} />
          <Route path="listings/new" element={<ListingEdit />} />
          <Route path="listings/:id" element={<ListingEdit />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="posts/new" element={<PostEdit />} />
          <Route path="posts/:id" element={<PostEdit />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </SiteProvider>
  )
}
