<?php

/**
 * @file
 * Solo Theme.
 *
 * Filename:     solo.theme
 * Website:      http://www.flashwebcenter.com
 * Description:  template
 * Author:       Alaa Haddad http://www.alaahaddad.com.
 */

/**
 * The theme settings.
 */

$form["solo_settings"]["settings_blueprint"] = [
  "#type" => "details",
  "#title" => t("<strong class='purple'>Theme Blueprint & Flexibility Showcase</strong> - Solo Theme"),
  "#collapsible" => TRUE,
  "#collapsed" => TRUE,
  "#description" => t("

<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;'>
  <h2 style='margin-top: 0; color: white;'>🚀 Unleash Your Creativity with 25+ Flexible Regions!</h2>
  <p style='font-size: 18px; margin-bottom: 0;'><strong>Solo Theme gives you unprecedented control</strong> - Build anything from simple blogs to complex business sites with our intuitive region system.</p>
</div>

<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;'>
  <div style='background: #f8f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #4CAF50;'>
    <h3 style='color: #4CAF50; margin-top: 0;'>✨ Perfect For Beginners</h3>
    <p>Drag, drop, and configure - no coding required!</p>
  </div>
  <div style='background: #f8f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #2196F3;'>
    <h3 style='color: #2196F3; margin-top: 0;'>🔧 Developer Paradise</h3>
    <p>Full control with custom CSS classes and advanced styling options.</p>
  </div>
</div>

<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>
  <h3 style='margin-top: 0; color: #856404;'>💡 Pro Tip: Start with our most popular combinations!</h3>
  <ul style='margin-bottom: 0;'>
    <li><strong>Business Sites:</strong> Header + Primary Menu + Welcome Text + Content + Footer regions</li>
    <li><strong>Portfolios:</strong> Highlighted + Top regions + Sidebar + Content showcase</li>
    <li><strong>E-commerce:</strong> Fixed Search + Primary Menu + Product regions + Social integration</li>
  </ul>
</div>

<h3 style='color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;'>🗺️ Your Website Blueprint - Every Region Explained</h3>
<p><strong>Hover over any region below to see real-world examples and use cases!</strong></p>

<div class='blueprint page-wrapper' style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;'>
        <div class='highlighted' style='background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🌟 Highlighted Region</h2><p><strong>Perfect for:</strong> Hero sections, special announcements, promotional banners<br><strong>Examples:</strong> 'Welcome to our site!', seasonal promotions, breaking news</p></div>

        <div class='primary-sidebar-menu' style='background: #667eea; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>📱 Primary Sidebar Menu</h2><p><strong>Perfect for:</strong> Mobile-friendly navigation, off-canvas menus<br><strong>Examples:</strong> Hamburger menu, category navigation, user account links</p></div>

        <div class='fixed-search-block' style='background: #36D1DC; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🔍 Fixed Search Block</h2><p><strong>Perfect for:</strong> Always-accessible search, e-commerce product search<br><strong>Examples:</strong> Floating search bar, autocomplete search, filter options</p></div>

        <div class='popup-login-block' style='background: #5B86E5; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🔐 Popup Login Block</h2><p><strong>Perfect for:</strong> User authentication, member areas, subscription forms<br><strong>Examples:</strong> Modal login, registration forms, social media login</p></div>

        <div class='primary-menu' style='background: #667eea; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🧭 Primary Menu</h2><p><strong>Perfect for:</strong> Main site navigation, mega menus, dropdown categories<br><strong>Examples:</strong> Horizontal nav bar, multi-level menus, CTA buttons</p></div>

        <div class='header' style='background: #764ba2; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🏠 Header Region</h2><p><strong>Perfect for:</strong> Logo placement, contact info, social media icons<br><strong>Examples:</strong> Company branding, phone numbers, 'Follow us' links</p></div>

        <div class='welcome-text' style='background: linear-gradient(45deg, #FD79A8, #FDCB6E); color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>👋 Welcome Text</h2><p><strong>Perfect for:</strong> Hero content, value propositions, mission statements<br><strong>Examples:</strong> 'We build amazing websites', company intro, featured services</p></div>

        <div class='top-regions' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin: 5px;'>
            <div class='top-one' style='background: #74b9ff; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📈 Top One</h3><p><strong>Perfect for:</strong> Key metrics, testimonials<br><strong>Examples:</strong> '500+ Happy Clients', featured review</p></div>
            <div class='top-two' style='background: #0984e3; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>🎯 Top Two</h3><p><strong>Perfect for:</strong> Service highlights, features<br><strong>Examples:</strong> '24/7 Support', key benefits</p></div>
            <div class='top-three' style='background: #6c5ce7; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>⚡ Top Three</h3><p><strong>Perfect for:</strong> Call-to-action, special offers<br><strong>Examples:</strong> 'Get Started Today', discount banners</p></div>
        </div>

        <div class='system-messages' style='background: #00b894; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>💬 System Messages</h2><p><strong>Perfect for:</strong> User feedback, form confirmations, error notifications<br><strong>Examples:</strong> 'Message sent successfully!', login errors, update notices</p></div>

        <div class='page-title-solo' style='background: #e17055; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>📄 Page Title</h2><p><strong>Perfect for:</strong> SEO-friendly headings, page identification<br><strong>Examples:</strong> 'About Us', 'Our Services', dynamic page titles</p></div>

        <div class='breadcrumb' style='background: #636e72; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🍞 Breadcrumb Navigation</h2><p><strong>Perfect for:</strong> User orientation, SEO, site hierarchy<br><strong>Examples:</strong> 'Home > Products > Laptops', navigation trail</p></div>

        <div class='main-regions' style='display: grid; grid-template-columns: 250px 1fr 250px; gap: 5px; margin: 5px;'>
            <div class='sidebar-first' style='background: #fd79a8; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📋 Sidebar First</h3><p><strong>Perfect for:</strong> Secondary navigation, widgets, ads<br><strong>Examples:</strong> Category filters, recent posts, newsletter signup</p></div>
            <div class='content' style='background: #00cec9; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📝 Main Content</h3><p><strong>Perfect for:</strong> Your primary content, articles, products<br><strong>Examples:</strong> Blog posts, product listings, page content</p></div>
            <div class='sidebar-second' style='background: #fd79a8; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📊 Sidebar Second</h3><p><strong>Perfect for:</strong> Related content, social feeds, promotions<br><strong>Examples:</strong> 'You might also like', Twitter feed, special offers</p></div>
        </div>

        <div class='bottom-regions' style='display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px; margin: 5px;'>
            <div class='bottom-one' style='background: #a29bfe; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>🏢 Bottom One</h3><p><strong>Perfect for:</strong> Company info, contact details<br><strong>Examples:</strong> Office locations, business hours</p></div>
            <div class='bottom-two' style='background: #fd79a8; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>🔗 Bottom Two</h3><p><strong>Perfect for:</strong> Quick links, resources<br><strong>Examples:</strong> 'Useful Links', download center</p></div>
            <div class='bottom-three' style='background: #fdcb6e; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📞 Bottom Three</h3><p><strong>Perfect for:</strong> Support info, help center<br><strong>Examples:</strong> FAQ links, support tickets</p></div>
            <div class='bottom-four' style='background: #55a3ff; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📰 Bottom Four</h3><p><strong>Perfect for:</strong> News, updates, blog feed<br><strong>Examples:</strong> Latest articles, company news</p></div>
        </div>

        <div class='footer-regions' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin: 5px;'>
            <div class='footer-one' style='background: #2d3436; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>🌐 Footer One</h3><p><strong>Perfect for:</strong> Essential links, legal pages<br><strong>Examples:</strong> Privacy Policy, Terms of Service</p></div>
            <div class='footer-two' style='background: #636e72; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>📧 Footer Two</h3><p><strong>Perfect for:</strong> Contact forms, newsletters<br><strong>Examples:</strong> 'Subscribe to our newsletter', contact info</p></div>
            <div class='footer-three' style='background: #2d3436; color: white; padding: 15px; border-radius: 8px;'><h3 style='margin-top: 0; color: white;'>🌍 Footer Three</h3><p><strong>Perfect for:</strong> Social media, location info<br><strong>Examples:</strong> Social icons, office addresses</p></div>
        </div>

        <div class='footer-menu' style='background: #2d3436; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>🔗 Footer Menu</h2><p><strong>Perfect for:</strong> Secondary navigation, sitemap links<br><strong>Examples:</strong> 'Quick Links', footer navigation, accessibility links</p></div>

        <div class='copyright' style='background: #2d3436; color: white; padding: 15px; margin: 5px; border-radius: 8px;'><h2 style='margin-top: 0; color: white;'>© Copyright & Credits</h2><p><strong>Perfect for:</strong> Legal information, theme credits<br><strong>Examples:</strong> '© 2024 Your Company', 'Powered by Solo Theme'</p></div>

        <div class='hidden-region' style='background: #ddd; color: #666; padding: 15px; margin: 5px; border-radius: 8px; border: 2px dashed #999;'><h2 style='margin-top: 0; color: #666;'>🔧 Hidden Region</h2><p><strong>Perfect for:</strong> Developer tools, admin blocks, staging content<br><strong>Examples:</strong> Custom blocks for Twig rendering, admin utilities</p></div>
    </div>

<div style='background: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin-top: 30px;'>
  <h3 style='color: #4CAF50; margin-top: 0;'>🎉 Ready to Build Something Amazing?</h3>
  <p style='margin-bottom: 0;'><strong>With Solo Theme, you're not just getting a theme - you're getting a complete website building system!</strong> Start with any region above and create exactly what you envision. No limitations, just possibilities.</p>
</div>

"),

];
