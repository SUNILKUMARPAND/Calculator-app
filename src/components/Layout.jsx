import Header from './Header'
import Sidebar from './Sidebar'

/** Page shell: header on top, sidebar on the left (a drawer on small screens), content on the right. */
export default function Layout({ headerProps, sidebarProps, children }) {
  return (
    <div className="app">
      <Header {...headerProps} />
      <div className="app-body">
        <Sidebar {...sidebarProps} />
        <main className="main" id="main">
          {children}
        </main>
      </div>
    </div>
  )
}
