<?php
use CodeIgniter\Router\RouteCollection;
/** @var RouteCollection $routes */
// ระบุ route ชัดเจน ไม่เปิด auto routing ให้เรียกเมธอดอื่นโดยไม่ได้ตั้งใจ
$routes->setAutoRoute(false);
$routes->get('api/health', 'Products::health');
$routes->get('api/products', 'Products::index');
$routes->get('api/products/(:num)', 'Products::show/$1');
$routes->post('api/products', 'Products::create');
$routes->put('api/products/(:num)', 'Products::update/$1');
$routes->delete('api/products/(:num)', 'Products::delete/$1');
