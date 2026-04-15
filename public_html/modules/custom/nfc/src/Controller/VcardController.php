<?php

namespace Drupal\nfc\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class VcardController extends ControllerBase {
  protected $requestStack;

  public function __construct(RequestStack $request_stack) {
    $this->requestStack = $request_stack;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('request_stack')
    );
  }

  /**
   * Download vCard file.
   */
  public function download($nid) {
    // Load node
    $node = Node::load($nid);
    $request = $this->requestStack->getCurrentRequest();
    $source = $request->query->get('source');

    // Validate node
    if (!$node || $node->bundle() !== 'nfc_profile') {
      throw new NotFoundHttpException();
    }

    // Get field values safely
    $full_name = $node->getTitle();
    $phone = $node->get('field_phone')->value ?? '';
    $email = $node->get('field_email')->value ?? '';

    // Optional fields (if you add later)
    $organization = $node->get('field_nfc_company')->value ?? '';
    $title = $node->get('field_full_name')->value ?? '';

    // Build vCard (v3.0 standard)
    $vcard = [];
    $vcard[] = 'BEGIN:VCARD';
    $vcard[] = 'VERSION:3.0';
    $vcard[] = 'FN:' . $this->escape($full_name);

    if (!empty($title)) {
      $vcard[] = 'TITLE:' . $this->escape($organization);
    }

    // if (!empty($organization)) {
    //   $vcard[] = 'ORG:' . $this->escape($organization);
    // }

    if (!empty($phone)) {
      $vcard[] = 'TEL;TYPE=CELL:' . $this->escape($phone);
    }

    if (!empty($email)) {
      $vcard[] = 'EMAIL:' . $this->escape($email);
    }

    if (!empty($source)) {
      $current_url = $source;
    }
    elseif ($request->headers->get('referer')) {
      $current_url = $request->headers->get('referer');
    }
    else {
      $current_url = $request->getSchemeAndHttpHost() . $request->getRequestUri();
    }

    $vcard[] = 'URL;TYPE=WEBLINK:' . $this->escape($current_url);
    $vcard[] = 'END:VCARD';

    $output = implode("\r\n", $vcard);

    // Create response
    $response = new Response($output);
    $response->headers->set('Content-Type', 'text/vcard; charset=utf-8');
    $response->headers->set('Content-Disposition', 'attachment; filename="contact.vcf"');
    $response->headers->set('Cache-Control', 'no-store, no-cache');

    return $response;
  }

  /**
   * Escape vCard values (basic sanitation).
   */
  private function escape($value) {
    return str_replace(["\n", "\r", ";", ","], ['\\n', '', '\;', '\,'], $value);
  }

}